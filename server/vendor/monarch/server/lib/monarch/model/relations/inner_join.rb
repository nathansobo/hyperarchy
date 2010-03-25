module Model
  module Relations
    class InnerJoin < Relation
      class << self
        def from_wire_representation(representation, repository)
          left_operand = Relation.from_wire_representation(representation["left_operand"], repository)
          right_operand = Relation.from_wire_representation(representation["right_operand"], repository)
          predicate = Predicates::Predicate.from_wire_representation(representation["predicate"], repository)
          new(left_operand, right_operand, predicate)
        end
      end

      attr_reader :left_operand, :right_operand, :predicate
      def initialize(left_operand, right_operand, predicate, &block)
        super(&block)
        @left_operand, @right_operand, @predicate = left_operand, right_operand, predicate
      end

      def column(name)
        left_operand.column(name) || right_operand.column(name)
      end

      def surface_tables
        left_operand.surface_tables + right_operand.surface_tables
      end

      def tuple_class
        return @tuple_class if @tuple_class
        @tuple_class = Class.new(CompositeTuple)
        @tuple_class.relation = self
        @tuple_class
      end

      def build_sql_query(query=Sql::Select.new)
        query.add_condition(predicate)
        left_operand.build_sql_query(query)
        right_operand.build_sql_query(query)
      end

      def sql_query_specification
        Sql::QuerySpecification.new(:all, sql_select_list, sql_table_ref)
      end

      def sql_select_list
        (left_operand.sql_select_list + right_operand.sql_select_list).map do |derived_column_or_asterisk|
          derived_column_or_asterisk.derive(self) do |derived_column|
            "#{derived_column.table_ref.name}__#{derived_column.name}"
          end
        end.flatten
      end

      def sql_table_ref
        Sql::JoinedTable.new(:inner, left_operand.sql_table_ref, right_operand.sql_table_ref, sql_join_conditions)
      end

      def sql_join_conditions
        [predicate.sql_predicate]
      end

      def sql_where_clause_predicates
        left_operand.sql_where_clause_predicates + right_operand.sql_where_clause_predicates
      end

      def build_record_from_database(field_values)
        tuple_class.new(field_values)
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        left_operand == other.left_operand && right_operand == other.right_operand && predicate == other.predicate
      end

      protected

      def subscribe_to_operands
        operand_subscriptions.add(left_operand.on_insert do |left_tuple|
          predicate.find_matching_tuples(left_tuple, right_operand).each do |right_tuple|
            composite_tuple = tuple_class.new([left_tuple, right_tuple])
            on_insert_node.publish(composite_tuple)
          end
        end)

        operand_subscriptions.add(right_operand.on_insert do |right_tuple|
          predicate.find_matching_tuples(right_tuple, left_operand).each do |left_tuple|
            composite_tuple = tuple_class.new([left_tuple, right_tuple])
            on_insert_node.publish(composite_tuple)
          end
        end)

        operand_subscriptions.add(left_operand.on_update do |left_tuple, changeset|
          new_tuples = predicate.find_matching_tuples(changeset.new_state, right_operand).map do |right_tuple|
            tuple_class.new([left_tuple, right_tuple])
          end

          previous_tuples = predicate.find_matching_tuples(changeset.old_state, right_operand).map do |right_tuple|
            tuple_class.new([left_tuple, right_tuple])
          end

          inserted_tuples = new_tuples - previous_tuples
          updated_tuples  = previous_tuples & new_tuples
          removed_tuples  = previous_tuples - new_tuples

          inserted_tuples.each {|tuple| on_insert_node.publish(tuple)}
          updated_tuples.each  {|tuple| on_update_node.publish(tuple, composite_changeset(tuple, changeset))}
          removed_tuples.each  {|tuple| on_remove_node.publish(tuple)}
        end)

        operand_subscriptions.add(right_operand.on_update do |right_tuple, changeset|
          new_tuples = predicate.find_matching_tuples(changeset.new_state, left_operand).map do |left_tuple|
            tuple_class.new([left_tuple, right_tuple])
          end

          previous_tuples = predicate.find_matching_tuples(changeset.old_state, left_operand).map do |left_tuple|
            tuple_class.new([left_tuple, right_tuple])
          end

          inserted_tuples = new_tuples - previous_tuples
          updated_tuples  = previous_tuples & new_tuples
          removed_tuples  = previous_tuples - new_tuples

          inserted_tuples.each {|tuple| on_insert_node.publish(tuple)}
          updated_tuples.each  {|tuple| on_update_node.publish(tuple, composite_changeset(tuple, changeset))}
          removed_tuples.each  {|tuple| on_remove_node.publish(tuple)}
        end)

        operand_subscriptions.add(left_operand.on_remove do |left_tuple|
          predicate.find_matching_tuples(left_tuple, right_operand).each do |right_tuple|
            composite_tuple = tuple_class.new([left_tuple, right_tuple])
            on_remove_node.publish(composite_tuple)
          end
        end)

        operand_subscriptions.add(right_operand.on_remove do |right_tuple|
          predicate.find_matching_tuples(right_tuple, left_operand).each do |left_tuple|
            composite_tuple = tuple_class.new([left_tuple, right_tuple])
            on_remove_node.publish(composite_tuple)
          end
        end)
      end

      def composite_changeset(composite_tuple, changeset_to_merge)
        composite_new_state = composite_tuple.snapshot(changeset_to_merge.new_state)
        composite_old_state = composite_tuple.snapshot(changeset_to_merge.old_state)
        Changeset.new(composite_new_state, composite_old_state)
      end
    end
  end
end

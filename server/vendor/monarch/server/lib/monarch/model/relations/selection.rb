module Model
  module Relations
    class Selection < Relation
      class << self
        def from_wire_representation(representation, repository)
          operand = Relation.from_wire_representation(representation["operand"], repository)
          predicate = Expressions::Expression.from_wire_representation(representation["predicate"], repository)
          new(operand, predicate)
        end
      end

      attr_reader :operand, :predicate
      delegate :column, :surface_tables, :build_record_from_database, :to => :operand

      def initialize(operand, predicate, &block)
        super(&block)
        @operand, @predicate = operand, predicate
      end

      def create(field_values={})
        operand.create(predicate.force_matching_field_values(field_values))
      end

      def create!(field_values={})
        operand.create!(predicate.force_matching_field_values(field_values))
      end

      def unsafe_create(field_values={})
        operand.unsafe_create(predicate.force_matching_field_values(field_values))
      end

      delegate :sql_set_quantifier, :sql_select_list, :sql_from_table_ref, :to => :operand

      def sql_where_clause_predicates(state)
        state[self][:sql_where_clause_predicates] ||=
          [predicate.sql_expression(state)] + operand.sql_where_clause_predicates(state)
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        operand == other.operand && predicate == other.predicate
      end

      protected

      def subscribe_to_operands
        operand_subscriptions.add(operand.on_insert do |record|
          on_insert_node.publish(record) if predicate.matches?(record)
        end)

        operand_subscriptions.add(operand.on_update do |record, changeset|
          if predicate.matches?(changeset.old_state)
            if predicate.matches?(changeset.new_state)
              on_update_node.publish(record, changeset)
            else
              on_remove_node.publish(record)
            end
          else
            if predicate.matches?(changeset.new_state)
              on_insert_node.publish(record)
            end
          end
        end)

        operand_subscriptions.add(operand.on_remove do |record|
          on_remove_node.publish(record) if predicate.matches?(record)
        end)
      end
    end
  end
end

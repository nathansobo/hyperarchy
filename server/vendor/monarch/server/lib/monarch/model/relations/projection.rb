module Model
  module Relations
    class Projection < Relations::Relation

      attr_reader :operand, :concrete_columns_by_name
      delegate :tables, :to => :operand

      def initialize(operand, concrete_columns, &block)
        super(&block)
        @operand, @concrete_columns = operand, concrete_columns
        @concrete_columns_by_name = ActiveSupport::OrderedHash.new
        concrete_columns.each do |column|
          concrete_columns_by_name[column.name] = column
        end
      end

      def concrete_columns
        concrete_columns_by_name.values
      end

      def column(column_or_name)
        case column_or_name
        when String, Symbol
          concrete_columns_by_name[column_or_name]
        when ConcreteColumn
          column_or_name
        end
      end

      def surface_tables
        nil
      end
      
      def tuple_class
        return @tuple_class if @tuple_class
        @tuple_class = Class.new(Tuple)
        @tuple_class.relation = self
        @tuple_class
      end

      def build_sql_query(sql_query=Sql::Select.new)
        sql_query.select_clause_columns = concrete_columns unless sql_query.has_explicit_select_clause_columns?
        operand.build_sql_query(sql_query)
      end

      delegate :sql_table_ref, :sql_where_clause_predicates, :to => :operand

      def sql_query_specification
        Sql::QuerySpecification.new(:all, sql_select_list, operand.sql_table_ref, sql_where_clause_predicates)
      end

      def build_record_from_database(field_values)
        tuple_class.new(field_values)
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        operand == other.operand && concrete_columns_by_name == other.concrete_columns_by_name
      end

      protected
      def sql_select_list
        concrete_columns.map do |column|
          column.sql_derived_column
        end
      end

      def subscribe_to_operands
        operand_subscriptions.add(operand.on_insert do |tuple|
          on_insert_node.publish(project_tuple(tuple))
        end)
        
        operand_subscriptions.add(operand.on_update do |tuple, changeset|
          projected_changeset = project_changeset(changeset)
          on_update_node.publish(project_tuple(tuple), projected_changeset) if projected_changeset.has_changes?
        end)

        operand_subscriptions.add(operand.on_remove do |tuple|
          on_remove_node.publish(project_tuple(tuple))
        end)
      end

      def project_tuple(tuple)
        field_values = {}
        concrete_columns_by_name.each do |name, column|
          column = column.column if column.instance_of?(AliasedColumn)
          field = tuple.field(column)
          field_values[name] = field.value if field
        end
        tuple_class.new(field_values)
      end

      def project_changeset(changeset)
        projected_new_state = project_tuple(changeset.new_state)
        projected_old_state = project_tuple(changeset.old_state)
        Changeset.new(projected_new_state, projected_old_state)
      end
    end
  end
end

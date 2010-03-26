module Model
  module Relations
    class Projection < Relations::Relation

      attr_reader :operand, :concrete_columns, :concrete_columns_by_name, :concrete_columns_by_underlying_expression
      delegate :tables, :to => :operand

      def initialize(operand, projected_expressions, &block)
        super(&block)
        @operand = operand
        @concrete_columns = projected_expressions.map {|expression| expression.derive(self)}
        @concrete_columns_by_name = {}
        @concrete_columns_by_underlying_expression = {}
        concrete_columns.each do |derived_column|
          concrete_columns_by_name[derived_column.name] = derived_column if derived_column.name
          concrete_columns_by_underlying_expression[derived_column.expression] = derived_column
        end
      end

      def value
        first[0]
      end

      def column(expression_or_name_or_index)
        case expression_or_name_or_index
        when String, Symbol
          concrete_columns_by_name[expression_or_name_or_index]
        when Expressions::Expression
          if (concrete_columns.include?(expression_or_name_or_index))
            expression_or_name_or_index
          else
            concrete_columns_by_underlying_expression[expression_or_name_or_index]
          end
        when Expressions::ConcreteColumn, Expressions::AggregationExpression
          expression_or_name_or_index
        when Integer
          concrete_columns[expression_or_name_or_index]
        end
      end

      def surface_tables
        nil
      end
      
      def tuple_class
        return @tuple_class if @tuple_class
        @tuple_class = Class.new(Tuples::Tuple)
        @tuple_class.relation = self
        @tuple_class
      end

      delegate :sql_update_table_ref, :sql_from_table_ref, :sql_where_clause_predicates, :to => :operand

      def sql_set_quantifier
        :all #TODO: make distinct if this projection strips out all primary keys
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
          column.sql_derived_column(sql_from_table_ref)
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
          field_values[name] = tuple.evaluate(column.expression)
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

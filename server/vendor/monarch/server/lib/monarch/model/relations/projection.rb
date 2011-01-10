module Monarch
  module Model
    module Relations
      class Projection < UnaryOperator

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

        def columns
          concrete_columns
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
          when Expressions::ConcreteColumn, Expressions::AggregationFunction
            expression_or_name_or_index
          when Integer
            concrete_columns[expression_or_name_or_index]
          end
        end

        def surface_tables
          [self]
        end

        def tuple_class
          return @tuple_class if @tuple_class
          @tuple_class = Class.new(Tuples::Tuple)
          @tuple_class.relation = self
          @tuple_class
        end

        def build_record_from_database(field_values)
          tuple_class.new(field_values)
        end

        def ==(other)
          return false unless other.instance_of?(self.class)
          operand == other.operand && concrete_columns_by_name == other.concrete_columns_by_name
        end

        def external_sql_select_list(state, external_relation)
          state[self][:external_sql_select_list] ||=
            concrete_columns.map do |column|
              column.derive(external_relation).sql_derived_column(state)
            end
        end

        def has_derived_external_table_ref?
          aggregation?
        end

        def external_sql_table_ref(state)
          state[self][:external_sql_table_ref] ||=
            if aggregation?
              Sql::DerivedTable.new(sql_query_specification(state), state.next_derived_table_name, self)
            else
              internal_sql_table_ref(state)
            end
        end

        def external_sql_where_predicates(state)
          aggregation?? [] : super
        end

        def external_sql_grouping_column_refs(state)
          aggregation?? [] : super
        end

        def external_sql_sort_specifications(state)
          aggregation?? [] : super
        end

        def aggregation?
          concrete_columns.any? do |expression|
            expression.aggregation?
          end
        end

        protected

        def internal_sql_select_list(state)
          state[self][:internal_sql_select_list] ||=
            concrete_columns.map do |column|
              column.sql_derived_column(state)
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
end
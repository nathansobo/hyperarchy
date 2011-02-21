module Monarch
  module Model
    module Expressions
      class AggregationFunction < Expression
        attr_reader :function_name, :column, :expression_alias
        delegate :convert_value_for_storage, :convert_value_for_wire, :to => :column

        def initialize(function_name, column)
          @function_name, @column = function_name, column
        end

        def sql_expression(state)
          state[self][:sql_expression] ||=
            Sql::Expressions::SetFunction.new(function_name, column.sql_expression(state))
        end

        def name
          expression_alias || function_name.to_sym
        end

        def to_sql
          sql_expression(SqlGenerationState.new).to_sql
        end

        def ==(other)
          return false unless other.instance_of?(self.class)
          function_name == other.function_name && column == other.column && expression_alias == other.expression_alias
        end

        def convert_value_for_storage(value)
          if function_name == "count"
            value.to_i
          else
            column.convert_value_for_storage(value)
          end
        end

        def aggregation?
          true
        end

        def type
          :integer
        end

        protected
        def alias_sql
          expression_alias ? " as #{expression_alias}" : ""
        end
      end
    end
  end
end
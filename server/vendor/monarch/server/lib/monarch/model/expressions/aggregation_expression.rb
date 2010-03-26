module Model
  module Expressions
    class AggregationExpression
      attr_reader :function_name, :column, :expression_alias
      delegate :convert_value_for_storage, :convert_value_for_wire, :to => :column

      def initialize(function_name, column)
        @function_name, @column = function_name, column
      end

      def as(expression_alias)
        @expression_alias = expression_alias
        self
      end

      def sql_derived_column(sql_table_ref)
        Sql::DerivedColumn.new(sql_table_ref, sql_expression, expression_alias)
      end

      def sql_expression
        Sql::Expressions::SetFunction.new(function_name, column.sql_expression)
      end

      def name
        expression_alias || sql_expression.to_sql.to_sym
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

      protected
      def alias_sql
        expression_alias ? " as #{expression_alias}" : ""
      end
    end
  end
end

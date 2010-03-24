module Model
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

    def to_select_clause_sql
      "#{function_name}(#{column.to_sql})#{alias_sql}"
    end

    def sql_derived_column
      Sql::DerivedColumn.new(Sql::Expressions::SetFunction.new(function_name, column.sql_expression))
    end

    def name
      expression_alias || to_select_clause_sql.to_sym
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

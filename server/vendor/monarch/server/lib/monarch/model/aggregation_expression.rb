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

    def to_sql
      "#{function_name}(#{column.to_sql})#{alias_sql}"
    end

    def name
      expression_alias || to_sql.to_sym 
    end

    protected
    def alias_sql
      expression_alias ? " as #{expression_alias}" : ""
    end
  end
end

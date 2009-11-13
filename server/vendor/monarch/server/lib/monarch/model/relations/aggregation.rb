module Model
  module Relations
    class Aggregation < Relation
      attr_reader :operand, :expressions_by_name

      def initialize(operand, expressions, &block)
        super(&block)
        @operand = operand
        @expressions_by_name = ActiveSupport::OrderedHash.new
        expressions.each do |expression|
          expressions_by_name[expression.name] = expression
        end
      end

      def value
        all.first[0]
      end

      def expressions
        expressions_by_name.values
      end

      def concrete_columns
        expressions
      end

      def column(name_or_expression_or_index)
        case name_or_expression_or_index
        when String, Symbol
          expressions_by_name[name_or_expression_or_index.to_sym]
        when AggregationExpression
          name_or_expression_or_index
        when Integer
          expressions[name_or_expression_or_index]
        end
      end

      def build_record_from_database(field_values)
        tuple_class.new(field_values)
      end

      protected
      def build_sql_query(query=SqlQuery.new)
        query.select_clause_columns = expressions
        operand.build_sql_query(query)
      end

      def tuple_class
        return @tuple_class if @tuple_class
        @tuple_class = Class.new(Tuple)
        @tuple_class.relation = self
        @tuple_class
      end
    end
  end
end

module Model
  module Expressions
    class And < Expression
      attr_reader :operands
      def initialize(operands)
        @operands = operands
      end

      def sql_expression
        Sql::Expressions::And.new(operands.map {|op| op.sql_expression})
      end
    end
  end
end

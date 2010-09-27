module Monarch
  module Model
    module Expressions
      class And < Expression
        class << self
          def from_wire_representation(representation, repository)
            operands = representation["operands"].map do |operand_wire_representation|
              Expression.from_wire_representation(operand_wire_representation, repository)
            end
            new(operands)
          end
        end


        attr_reader :operands
        def initialize(operands)
          @operands = operands
        end

        def sql_expression(state)
          state[self][:sql_expression] ||=
            Sql::Expressions::And.new(operands.map {|op| op.sql_expression(state)})
        end
      end
    end
  end
end
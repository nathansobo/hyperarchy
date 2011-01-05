module Monarch
  module Model
    module Relations
      class Offset < UnaryOperator
        attr_reader :n


        class << self
          def from_wire_representation(representation, repository)
            operand = Relation.from_wire_representation(representation["operand"], repository)
            n = representation["n"]
            new(operand, n)
          end
        end


        def initialize(operand, n, &block)
          super(&block)
          @operand = operand
          @n = n
        end

        def ==(other)
          return false unless other.instance_of?(self.class)
          operand == other.operand && n == other.n
        end

        def internal_sql_offset
          n
        end
      end
    end
  end
end
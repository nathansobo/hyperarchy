module Monarch
  module Model
    module Relations
      class Offset < RetrievalDirective
        attr_reader :n

        class << self
          def from_wire_representation(representation, repository)
            operand = Relation.from_wire_representation(representation["operand"], repository)
            n = representation["n"]
            new(operand, n)
          end
        end

        def internal_sql_offset
          n
        end
      end
    end
  end
end
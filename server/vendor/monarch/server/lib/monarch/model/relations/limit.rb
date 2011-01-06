module Monarch
  module Model
    module Relations
      class Limit < RetrievalDirective
        attr_reader :n

        class << self
          def from_wire_representation(representation, repository)
            operand = Relation.from_wire_representation(representation["operand"], repository)
            n = representation["n"]
            new(operand, n)
          end
        end

        def internal_sql_limit
          n
        end
      end
    end
  end
end
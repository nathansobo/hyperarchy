module Model
  module Predicates
    class Predicate
      class << self
        def from_wire_representation(representation, repository)
          case representation["type"]
          when "eq"
            Eq.from_wire_representation(representation, repository)
          else
            raise "No way to translate #{representation} into a Predicate"
          end
        end
      end

      def and(right_operand)
        And.new(self, right_operand)
      end
    end
  end
end

module Model
  module Predicates
    class Predicate
      class << self
        def from_wire_representation(representation)
          case representation["type"]
          when "eq"
            Eq.from_wire_representation(representation)
          else
            raise "No way to translate #{representation} into a Predicate"
          end
        end
      end
    end
  end
end
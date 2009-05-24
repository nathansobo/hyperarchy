module Model
  module Relations
    class Relation
      class << self
        def from_wire_representation(representation, subdomain)
          case representation["type"]
          when "set"
            subdomain.resolve_named_relation(representation["name"])
          when "selection"
            Selection.from_wire_representation(representation, subdomain)
          when "inner_join"
            InnerJoin.from_wire_representation(representation, subdomain)
          when "set_projection"
            SetProjection.from_wire_representation(representation, subdomain)
          end
        end
      end
      include ForwardsArrayMethodsToTuples

      def where(predicate)
        Selection.new(self, predicate)
      end

      def join(right_operand)
        PartiallyConstructedInnerJoin.new(self, normalize_to_relation(right_operand))
      end

      def project(projected_set)
        SetProjection.new(self, normalize_to_relation(projected_set))
      end

      def normalize_to_relation(relation_or_tuple_class)
        if relation_or_tuple_class.instance_of?(Class)
          relation_or_tuple_class.set
        else
          relation_or_tuple_class
        end
      end

      def find(id)
        where(tuple_class.id.eq(id)).tuples.first
      end

      def tuples
        Origin.read(tuple_class, to_sql)
      end

      def tuple_wire_representations
        tuples.map {|tuple| tuple.wire_representation}
      end

      class PartiallyConstructedInnerJoin
        attr_reader :left_operand, :right_operand
        def initialize(left_operand, right_operand)
          @left_operand, @right_operand = left_operand, right_operand
        end

        def on(predicate)
          InnerJoin.new(left_operand, right_operand, predicate)
        end
      end
    end
  end
end
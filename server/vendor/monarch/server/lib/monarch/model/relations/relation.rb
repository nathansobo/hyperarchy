module Model
  module Relations
    class Relation
      class << self
        def from_wire_representation(representation, repository)
          case representation["type"]
          when "table"
            repository.resolve_table_name(representation["name"])
          when "selection"
            Selection.from_wire_representation(representation, repository)
          when "inner_join"
            InnerJoin.from_wire_representation(representation, repository)
          when "table_projection"
            TableProjection.from_wire_representation(representation, repository)
          end
        end
      end
      include ForwardsArrayMethodsToRecords

      def where(predicate)
        Selection.new(self, predicate)
      end

      def join(right_operand)
        PartiallyConstructedInnerJoin.new(self, normalize_to_relation(right_operand))
      end

      def project(projected_table)
        TableProjection.new(self, normalize_to_relation(projected_table))
      end

      def normalize_to_relation(relation_or_record_class)
        if relation_or_record_class.instance_of?(Class)
          relation_or_record_class.table
        else
          relation_or_record_class
        end
      end

      def find(id_or_predicate)
        predicate = (id_or_predicate.is_a?(Predicates::Predicate)? id_or_predicate : record_class[:id].eq(id_or_predicate))
        where(predicate).records.first
      end

      def records
        Origin.read(record_class.table, to_sql)
      end

      def record_wire_representations
        records.map {|record| record.wire_representation}
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

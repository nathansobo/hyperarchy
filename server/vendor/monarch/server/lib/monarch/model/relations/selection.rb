module Model
  module Relations
    class Selection < Relation
      class << self
        def from_wire_representation(representation, repository)
          operand = Relation.from_wire_representation(representation["operand"], repository)
          predicate = Predicates::Predicate.from_wire_representation(representation["predicate"], repository)
          new(operand, predicate)
        end
      end


      attr_reader :operand, :predicate

      def initialize(operand, predicate)
        @operand, @predicate = operand, predicate
      end

      def constituent_tables
        operand.constituent_tables
      end

      def table
        operand.table
      end

      def record_class
        operand.record_class
      end

      def build_sql_query(query=SqlQuery.new)
        query.add_condition(predicate)
        operand.build_sql_query(query)
      end
    end
  end
end

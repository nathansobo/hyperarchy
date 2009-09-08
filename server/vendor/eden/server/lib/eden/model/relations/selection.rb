module Model
  module Relations
    class Selection < Relation
      class << self
        def from_wire_representation(representation, subdomain)
          operand = Relation.from_wire_representation(representation["operand"], subdomain)
          predicate = Predicates::Predicate.from_wire_representation(representation["predicate"])
          new(operand, predicate)
        end
      end


      attr_reader :operand, :predicate

      def initialize(operand, predicate)
        @operand, @predicate = operand, predicate
      end

      def record_class
        operand.record_class
      end

      def to_sql
        build_sql_query.to_sql
      end

      def build_sql_query(query=SqlQuery.new)
        query.add_condition(predicate)
        operand.build_sql_query(query)
      end
    end
  end
end

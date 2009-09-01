module Model
  module Relations
    class SetProjection < Relation
      class << self
        def from_wire_representation(representation, subdomain)
          operand = Relation.from_wire_representation(representation["operand"], subdomain)
          projected_set = subdomain.resolve_named_relation(representation["projected_set"]).tuple_class.set
          new(operand, projected_set)
        end
      end

      attr_reader :operand, :projected_set
      def initialize(operand, projected_set)
        @operand, @projected_set = operand, projected_set
      end

      def to_sql
        build_sql_query.to_sql
      end

      def tuple_class
        projected_set.tuple_class
      end

      def build_sql_query(query=SqlQuery.new)
        query.projected_set = projected_set unless query.projected_set
        operand.build_sql_query(query)
      end
    end
  end
end
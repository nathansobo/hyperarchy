module Relations
  class InnerJoin < Relation
    class << self
      def from_wire_representation(representation, subdomain)
        left_operand = Relation.from_wire_representation(representation["left_operand"], subdomain)
        right_operand = Relation.from_wire_representation(representation["right_operand"], subdomain)
        predicate = Predicates::Predicate.from_wire_representation(representation["predicate"])
        new(left_operand, right_operand, predicate)
      end
    end

    attr_reader :left_operand, :right_operand, :predicate
    def initialize(left_operand, right_operand, predicate)
      @left_operand, @right_operand, @predicate = left_operand, right_operand, predicate
    end 

    def build_sql_query(query)
      query.add_condition(predicate)
      left_operand.build_sql_query(query)
      right_operand.build_sql_query(query)
    end
  end
end

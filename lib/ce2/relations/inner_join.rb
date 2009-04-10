module Relations
  class InnerJoin < Relation
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

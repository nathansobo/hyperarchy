module Relations
  class Selection < Relation
    attr_reader :operand, :predicate

    def initialize(operand, predicate)
      @operand, @predicate = operand, predicate
    end

    def tuple_class
      operand.tuple_class
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
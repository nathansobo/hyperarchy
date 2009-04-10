module Relations
  class SetProjection < Relation
    attr_reader :operand, :projected_set
    def initialize(operand, projected_set)
      @operand, @projected_set = operand, projected_set
    end

    def to_sql
      build_sql_query.to_sql
    end

    def build_sql_query(query=SqlQuery.new)
      query.projected_set = projected_set unless query.projected_set
      operand.build_sql_query(query)
    end
  end
end
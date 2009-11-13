module Model
  module Relations
    class TableProjection < Relation
      class << self
        def from_wire_representation(representation, repository)
          operand = Relation.from_wire_representation(representation["operand"], repository)
          projected_table = repository.resolve_table_name(representation["projected_table"]).table
          new(operand, projected_table)
        end
      end

      delegate :column, :to => :projected_table
      attr_reader :operand, :projected_table
      def initialize(operand, projected_table, &block)
        super(&block)
        @operand, @projected_table = operand, projected_table
      end

      def build_sql_query(query=SqlQuery.new)
        query.select_clause_columns = projected_table.concrete_columns.map {|c| ProjectedColumn.new(c)}
        operand.build_sql_query(query)
      end

      def build_record_from_database(field_values)
        projected_table.build_record_from_database(field_values)
      end
    end
  end
end

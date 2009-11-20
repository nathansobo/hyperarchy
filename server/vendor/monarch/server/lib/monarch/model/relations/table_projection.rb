module Model
  module Relations
    class TableProjection < Relation
      class << self
        def from_wire_representation(representation, repository)
          operand = Relation.from_wire_representation(representation["operand"], repository)
          projected_table = repository.resolve_table_name(representation["projected_table"]).surface_tables.first
          new(operand, projected_table)
        end
      end

      delegate :column, :to => :projected_table
      attr_reader :operand, :projected_table
      def initialize(operand, projected_table, &block)
        super(&block)
        @operand, @projected_table = operand, projected_table
      end

      def surface_tables
        [projected_table]
      end

      def build_sql_query(query=SqlQuery.new)
        query.select_clause_columns = projected_table.concrete_columns.map {|c| ProjectedColumn.new(c)} unless query.has_explicit_select_clause_columns?
        operand.build_sql_query(query)
      end

      def build_record_from_database(field_values)
        projected_table.build_record_from_database(field_values)
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        operand == other.operand && projected_table == other.projected_table
      end
    end
  end
end

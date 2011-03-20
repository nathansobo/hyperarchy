module Prequel
  module Sql
    class UpdateStatement < Query
      attr_reader :table_refs, :attributes, :updated_table_ref

      def initialize(relation, attributes)
        super(relation)
        @attributes = attributes
      end

      def build
        super
        resolve_attributes
        determine_table_refs
        self
      end

      def perform
        dataset.update
      end

      protected

      def sql_string
        [update_clause_sql,
         set_clause_sql,
         from_clause_sql,
         where_clause_sql
        ].compact.join(" ")
      end

      def update_clause_sql
        "update #{updated_table_ref.name}"
      end

      def set_clause_sql
        "set " + attributes.map do |field_name, value|
          "#{field_name} = #{value.to_set_clause_sql}"
        end.join(", ")
      end

      def from_clause_sql
        return nil unless table_refs
        "from " + table_refs.map(&:to_sql).join(", ")
      end

      def resolve_attributes
        @attributes = Hash[attributes.map do |name, expression|
          [name, expression.resolve_in_query(self)]
        end]
      end

      def determine_table_refs
        @table_refs, join_predicates = table_ref.flatten_table_refs
        conditions.concat(join_predicates)
        if table_refs.size > 1
          @updated_table_ref = projected_table_ref
          table_refs.delete(updated_table_ref)
        else
          @updated_table_ref = table_refs.first
          @table_refs = nil
        end
      end
    end
  end
end
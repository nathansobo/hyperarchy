module Prequel
  module Sql
    class UpdateStatement < Query
      attr_reader :table_refs, :attributes

      def initialize(relation, attributes)
        super(relation)
        @attributes = attributes
      end

      def build
        super
        resolve_attributes
        @table_refs = table_ref.flatten_table_refs
        self
      end

      def perform
        dataset.update
      end

      protected

      def sql_string
        [update_clause_sql,
         set_clause_sql,
         where_clause_sql
        ].compact.join(" ")
      end

      def update_clause_sql
        "update #{table_ref.name}"
      end

      def set_clause_sql
        "set " + attributes.map do |field_name, value|
          "#{field_name} = #{value.to_sql}"
        end.join(", ")
      end

      def resolve_attributes
        @attributes = Hash[attributes.map do |name, expression|
          [name, expression.resolve_in_query(self)]
        end]
      end
    end
  end
end
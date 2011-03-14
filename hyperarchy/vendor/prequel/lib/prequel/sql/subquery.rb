module Prequel
  module Sql
    class Subquery < Query
      include NamedTableRef

      attr_reader :parent, :relation, :name
      delegate :columns, :to => :relation

      def initialize(parent, relation, name)
        @parent, @name = parent, name
        super(relation)
      end

      delegate :add_literal, :add_singular_table_ref, :add_subquery, :singular_table_refs, :to => :parent

      def to_sql
        ['(', sql_string, ') as ', name].join
      end

      def build_tuple(field_values)
        tuple_builder.build_tuple(extract_field_values(field_values))
      end
    end
  end
end

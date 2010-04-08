module Model
  module Sql
    class DerivedTable
      attr_accessor :subquery, :name

      def initialize(subquery, name)
        @subquery, @name = subquery, name
      end

      def to_sql
        "(#{subquery.to_sql}) as #{name}"
      end

      def inner_join_conditions
        []
      end

      def inner_joined_table_refs
        [self]
      end
    end
  end
end
module Monarch
  module Model
    module Sql
      class DerivedTable
        attr_accessor :subquery, :name, :algebra_relation, :suppress_alias

        def initialize(subquery, name, algebra_relation)
          @subquery, @name, @algebra_relation = subquery, name, algebra_relation
        end

        def to_sql
          "(#{subquery.to_sql})" + (suppress_alias ? "" : " as #{name}")
        end

        def literals_hash
          subquery.literals_hash
        end

        def inner_join_conditions
          []
        end

        def algebra_columns
          algebra_relation.concrete_columns
        end

        def inner_joined_table_refs
          [self]
        end
      end
    end
  end
end
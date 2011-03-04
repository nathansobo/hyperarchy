module Prequel
  module Expressions
    class DerivedColumn
      attr_reader :relation, :expression, :alias_name
      delegate :origin, :to => :expression

      def initialize(relation, expression, alias_name)
        @relation, @expression, @alias_name = relation, expression, alias_name
      end

      def name
        alias_name || expression.name
      end

      def resolve_in_query(query)
        if subquery = query.singular_table_refs[relation]
          subquery.resolve_derived_column(self)
        else
          expression.resolve_in_query(query)
        end
      end
    end
  end
end

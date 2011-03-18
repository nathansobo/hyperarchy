module Prequel
  module Expressions
    class DerivedColumn
      extend EqualityDerivation

      attr_reader :relation, :expression, :alias_name
      delegate :origin, :qualified_name, :wire_representation, :to => :expression

      def initialize(relation, expression, alias_name)
        @relation, @expression, @alias_name = relation, expression, alias_name
      end

      def name
        alias_name || expression.name
      end

      derive_equality :relation, :expression, :alias_name

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

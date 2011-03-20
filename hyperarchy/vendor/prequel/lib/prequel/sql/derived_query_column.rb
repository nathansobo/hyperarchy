module Prequel
  module Sql
    class DerivedQueryColumn
      attr_reader :subquery, :name, :expression

      def initialize(subquery, name, expression)
        @subquery, @name, @expression = subquery, name, expression
      end

      def to_sql
        if subquery.name
          "#{subquery.name}.#{name}"
        else
          expression.to_sql
        end
      end

      def to_select_clause_sql
        "#{expression.to_sql} as #{name}"
      end

      def qualified_name
        "#{subquery.name}__#{name}"
      end
    end
  end
end

module Prequel
  module Relations
    class Relation
      delegate :to_sql, :result_set, :all, :first, :to => :query

      def query
        Sql::Query.new(self).build
      end

      def find(id)
        where(:id => id).first
      end

      def where(predicate)
        Selection.new(self, predicate)
      end

      def join(right, predicate=nil)
        InnerJoin.new(self, right, predicate)
      end

      def left_join(right, predicate=nil)
        LeftJoin.new(self, right, predicate)
      end

      def project(*expressions)
        Projection.new(self, *expressions)
      end

      def group_by(*expressions)
        GroupBy.new(self, *expressions)
      end

      def order_by(*order_specs)
        OrderBy.new(self, *order_specs)
      end

      def limit(count)
        Limit.new(self, count)
      end

      def offset(count)
        Offset.new(self, count)
      end

      def table_ref(query)
        singular_table_ref(query)
      end

      def singular_table_ref(query)
        query.add_subquery(self)
      end

      def to_relation
        self
      end

      def get_column(name)
        resolved = resolve(name)
        derive(resolved) if resolved
      end

      protected

      def resolve(expression)
        expression.resolve_in_relations(operands)
      end

      def derive(resolved_expression)
        if resolved_expression.instance_of?(Expressions::AliasedExpression)
          alias_name = resolved_expression.alias_name
          resolved_expression = resolved_expression.expression
        end

          derived_columns[resolved_expression] ||=
          Expressions::DerivedColumn.new(self, resolved_expression, alias_name).tap do |derived_column|
            derived_columns[resolved_expression] = derived_column
            derived_columns_by_name[derived_column.name] = derived_column
          end
      end

      def derived_columns
        @derived_columns ||= {}
      end

      def derived_columns_by_name
        @derived_columns_by_name ||= {}
      end
    end
  end
end

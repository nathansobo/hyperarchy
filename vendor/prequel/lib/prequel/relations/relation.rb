module Prequel
  module Relations
    class Relation
      extend EqualityDerivation

      delegate :to_sql, :dataset, :all, :first, :count, :size, :each, :empty?, :to => :query

      def query(parent=nil)
        query_class.new(self, parent).build
      end

      def query_class
        Sql::Query
      end

      def update_statement(attributes)
        relation_to_update = pull_up_conditions
        update_attributes = relation_to_update.resolve_update_attributes(attributes)
        Sql::UpdateStatement.new(relation_to_update, update_attributes).build
      end

      def to_update_sql(attributes)
        update_statement(attributes).to_sql
      end

      def update(attributes)
        update_statement(attributes).perform
      end

      def increment(column_name, count=1)
        update(column_name => column_name + count)
      end

      def decrement(column_name, count=1)
        update(column_name => column_name - count)
      end

      def add_to_client_dataset(dataset)
        each do |record|
          record.add_to_client_dataset(dataset)
        end
      end

      def find(arg)
        return nil unless arg
        predicate = arg.to_predicate
        where(predicate).first
      end

      def where(predicate)
        Selection.new(self, predicate)
      end

      def where_any(hash)
        where(hash.or_predicate)
      end

      def join(right, predicate=nil)
        InnerJoin.new(self, right, predicate)
      end

      def join_through(right, predicate=nil)
        tables = right.tables
        raise "Can only join through to a relation with a single surface table" unless tables.size == 1
        join(right, predicate).project(tables.first)
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

      def union(right)
        Union.new(self, right)
      end

      alias_method :|, :union

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

      def extract_conditions
        [self, []]
      end

      protected

      def resolve(expression)
        expression.resolve_in_relations(operands)
      end

      def resolve_update_attributes(attributes)
        Hash[attributes.map do |name, expression|
          [name, expression.resolve_in_relations([self])]
        end]
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

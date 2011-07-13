module Prequel
  module Relations
    class Union < Relation
      attr_reader :left, :right
      delegate :new, :infer_join_columns, :secure_create, :to => :left

      def initialize(left, right)
        @left, @right= left, right
      end

      def query_class
        Sql::UnionQuery
      end

      def columns
        left.columns.map do |column|
          derive(column)
        end
      end

      def visit(query)
        if query.instance_of?(Sql::UnionQuery)
          query.left = left.query(query)
          query.right = right.query(query)
        else
          query.table_ref = query.add_subquery(self)
        end
      end

      def get_table(name)
        left.get_table(name) || right.get_table(name)
      end

      protected

      def operands
        [left, right]
      end
    end
  end
end

module Prequel
  module Relations
    class Union < Relation
      attr_reader :left, :right
      delegate :infer_join_columns, :to => :left

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

      def visit(union_query)
        union_query.left = left.query(union_query)
        union_query.right = right.query(union_query)
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

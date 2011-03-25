module Prequel
  module Relations
    class Union < Relation
      attr_reader :left, :right

      def initialize(left, right)
        @left, @right= left, right
      end

      def query(parent=nil)
        Sql::UnionQuery.new(parent).tap do |union_query|
          union_query.left = left.query(union_query)
          union_query.right = right.query(union_query)
        end.build
      end
    end
  end
end

module Prequel
  module Relations
    class Union < Relation
      attr_reader :left, :right
      delegate :infer_join_columns, :to => :left

      def initialize(left, right)
        @left, @right= left, right
      end

      def query(parent=nil)
        Sql::UnionQuery.new(parent).tap do |union_query|
          union_query.left = left.query(union_query)
          union_query.right = right.query(union_query)
        end.build
      end

      # PROVE THIS IS NEEDED
#      def get_table(name)
#        left.get_table(name) || right.get_table(name)
#      end

      protected

      def operands
        [left, right]
      end
    end
  end
end

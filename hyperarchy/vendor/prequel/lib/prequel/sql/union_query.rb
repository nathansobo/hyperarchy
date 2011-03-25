module Prequel
  module Sql
    class UnionQuery
      attr_accessor :parent, :left, :right
      def initialize(parent=nil)
        @parent = parent
        @literals = {}
        @queries = []
      end

      def literals
        parent.try(:literals) || @literals
      end

      def to_sql
        ["(#{left.to_sql.first}) union (#{right.to_sql.first})", literals]
      end

      protected

      def sql_string
        queries.map(&:to_sql).join(" union ")
      end
    end
  end
end
module Prequel
  module Sql
    class UnionQuery < Query
      attr_accessor :parent, :left, :right

      delegate :tuple_builder, :to => :left

      def build
        relation.visit(self)
        self
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
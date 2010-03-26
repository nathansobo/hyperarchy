module Model
  module Expressions
    class AliasedExpression
      attr_reader :column, :column_alias

      def initialize(column, column_alias)
        @column, @column_alias = column, column_alias
      end

      def derive(relation)
        DerivedColumn.new(relation, column, column_alias)
      end

      def name
        column_alias || column.name
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        column == other.column && column_alias == other.column_alias
      end
    end
  end
end

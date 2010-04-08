module Model
  module Expressions
    class DerivedColumn < Column
      attr_reader :relation, :expression, :name
      delegate :convert_value_for_storage, :convert_value_for_wire, :type, :eq, :aggregation?, :to => :expression

      def initialize(relation, expression, name)
        @relation, @expression, @name = relation, expression, name
      end

      def sql_derived_column
        sql_name = name unless name.to_s == expression.sql_expression.to_sql
        Sql::DerivedColumn.new(relation.sql_from_table_ref, expression.sql_expression, sql_name)
      end

      def sql_expression
        Sql::ColumnRef.new(relation.sql_joined_table_ref, name)
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        name == other.name && expression == other.expression
      end
    end
  end
end

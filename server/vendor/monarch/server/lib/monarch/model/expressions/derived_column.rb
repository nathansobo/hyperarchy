module Model
  module Expressions
    class DerivedColumn < Column
      attr_reader :relation, :expression, :name

      delegate :convert_value_for_storage, :convert_value_for_wire, :type, :eq, :sql_expression, :to => :expression

      def initialize(relation, expression, name)
        @relation, @expression, @name = relation, expression, name
      end

      def sql_derived_column(table_ref)
        sql_name = name unless name.to_s == sql_expression.to_sql
        Sql::DerivedColumn.new(table_ref, sql_expression, sql_name)
      end

      def sql_expression
        expression.sql_expression
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        name == other.name && expression == other.expression
      end
    end
  end
end

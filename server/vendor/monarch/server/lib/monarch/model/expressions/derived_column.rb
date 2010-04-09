module Model
  module Expressions
    class DerivedColumn < Column
      attr_reader :relation, :expression, :name
      delegate :convert_value_for_storage, :convert_value_for_wire, :type, :eq, :aggregation?, :to => :expression

      def initialize(relation, expression, name)
        @relation, @expression, @name = relation, expression, name
      end

      def sql_derived_column(state)
        state[self][:sql_derived_column] ||= begin
          sql_name = name unless name.to_s == expression.sql_expression(state).to_sql
          Sql::DerivedColumn.new(relation.sql_from_table_ref(state), expression.sql_expression(state), sql_name)
        end
      end

      def sql_expression(state)
        state[self][:sql_expression] ||= begin
          if relation.aggregation?
            Sql::ColumnRef.new(relation.sql_joined_table_ref(state), name)
          else
            expression.sql_expression(state)
          end
        end
      end

      def ==(other)
        return false unless other.instance_of?(self.class)
        name == other.name && expression == other.expression
      end
    end
  end
end

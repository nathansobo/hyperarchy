module Model
  module Relations
    class LeftOuterJoin < Join
      attr_reader :left_operand, :right_operand, :predicate

      def initialize(left_operand, right_operand, predicate, &block)
        super(&block)
        @left_operand, @right_operand, @predicate = left_operand, right_operand, predicate
      end

      def sql_join_type
        :left_outer
      end

      def sql_from_table_ref
        Sql::OuterJoinedTable.new(:left, left_operand.sql_from_table_ref, right_operand.sql_from_table_ref, sql_join_conditions)
      end

      def sql_join_conditions
        [predicate.sql_predicate] + right_operand.sql_where_clause_predicates
      end

      def sql_where_clause_predicates
        []
      end
    end
  end
end
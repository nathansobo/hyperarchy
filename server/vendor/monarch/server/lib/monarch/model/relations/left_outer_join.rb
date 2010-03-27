module Model
  module Relations
    class LeftOuterJoin < Join
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
module Model
  module Relations
    class LeftOuterJoin < Join
      def sql_join_type
        :left_outer
      end

      def sql_from_table_ref(state)
        state[self][:sql_from_table_ref] ||=
          Sql::OuterJoinedTable.new(:left, left_operand.sql_from_table_ref(state), right_operand.sql_from_table_ref(state), sql_join_conditions(state))
      end

      def sql_join_conditions(state)
        state[self][:sql_join_conditions] ||=
          [predicate.sql_expression(state)] + right_operand.sql_where_clause_predicates(state)
      end

      def sql_where_clause_predicates(state)
        left_operand.sql_where_clause_predicates(state)
      end
    end
  end
end
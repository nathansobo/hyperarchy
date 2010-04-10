module Model
  module Relations
    class LeftOuterJoin < Join
      def sql_join_type
        :left_outer
      end

      protected

      def internal_sql_table_ref(state)
        state[self][:internal_sql_table_ref] ||=
          Sql::OuterJoinedTable.new(:left, left_operand.external_sql_table_ref(state), right_operand.external_sql_table_ref(state), sql_join_conditions(state))
      end

      def sql_join_conditions(state)
        state[self][:sql_join_conditions] ||=
          [predicate.sql_expression(state)] + right_operand.external_sql_where_predicates(state)
      end

      def internal_sql_where_predicates(state)
        left_operand.external_sql_where_predicates(state)
      end
    end
  end
end
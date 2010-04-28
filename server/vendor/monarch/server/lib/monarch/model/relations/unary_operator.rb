module Monarch
  module Model
    module Relations
      class UnaryOperator < Relation
        attr_reader :operand

        def internal_sql_select_list(state)
          operand.external_sql_select_list(state, self)
        end

        def internal_sql_table_ref(state)
          operand.external_sql_table_ref(state)
        end

        def internal_sql_where_predicates(state)
          operand.external_sql_where_predicates(state)
        end

        def internal_sql_grouping_column_refs(state)
          operand.external_sql_grouping_column_refs(state)
        end

        def internal_sql_sort_specifications(state)
          operand.external_sql_sort_specifications(state)
        end
      end
    end
  end
end
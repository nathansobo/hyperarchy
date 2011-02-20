module Monarch
  module Model
    module Sql
      class InnerJoinedTable < JoinedTable
        def inner_join_conditions
          left_table_ref.inner_join_conditions + conditions + right_table_ref.inner_join_conditions
        end

        def inner_joined_table_refs
          (left_table_ref.inner_joined_table_refs + right_table_ref.inner_joined_table_refs).uniq
        end

        protected
        def join_operator_sql
          "inner join"
        end
      end
    end
  end
end
module Monarch
  module Model
    module Sql
      class JoinedTable
        attr_accessor :left_table_ref, :right_table_ref, :conditions
        def initialize(left_table_ref, right_table_ref, conditions)
          @left_table_ref = left_table_ref
          @right_table_ref = right_table_ref
          @conditions = conditions
        end

        def to_sql
          [left_table_ref.to_sql,
           join_operator_sql,
           right_table_ref.to_sql,
           join_conditions_sql
          ].join(" ")
        end

        protected

        def join_conditions_sql
          return nil if type == :union
          "on " + conditions.map do |predicate|
            predicate.to_sql
          end.join(" and ")
        end
      end
    end
  end
end
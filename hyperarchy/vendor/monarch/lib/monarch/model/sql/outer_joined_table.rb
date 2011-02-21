module Monarch
  module Model
    module Sql
      class OuterJoinedTable < JoinedTable
        attr_reader :type, :left_table_ref, :right_table_ref, :conditions

        def initialize(type, left_table_ref, right_table_ref, conditions)
          @type = type
          super(left_table_ref, right_table_ref, conditions)
        end

        def inner_join_conditions
          []
        end

        def inner_joined_table_refs
          [self]
        end

        protected

        def join_operator_sql
          "#{type} outer join"
        end
      end
    end
  end
end
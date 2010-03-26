module Model
  module Sql
    class JoinedTable
      # :type can be INNER, LEFT OUTER, or RIGHT OUTER
      # the table refs can be aliased, derived, or joined tables
      # the condition is a Predicate involving column refs or expressions
      attr_accessor :type, :left_table_ref, :right_table_ref, :conditions

      def initialize(type, left_table_ref, right_table_ref, conditions)
        @type = type
        @left_table_ref = left_table_ref
        @right_table_ref = right_table_ref
        @conditions = conditions
      end

      def to_sql
        [left_table_ref.to_sql,
         join_sql,
         right_table_ref.to_sql,
         join_conditions_sql
        ].join(" ")
      end

      def join_conditions
        left_table_ref.join_conditions + conditions + right_table_ref.join_conditions
      end

      def joined_table_refs
        (left_table_ref.joined_table_refs + right_table_ref.joined_table_refs).uniq
      end

      protected

      def join_sql
        type == :union ? "union" : "#{type} join"
      end

      def join_conditions_sql
        return nil if type == :union
        "on " + conditions.map do |predicate|
          predicate.to_sql
        end.join(" ")
      end
    end
  end
end

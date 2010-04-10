module Model
  module Relations
    class Join < Relation
      attr_reader :left_operand, :right_operand, :predicate
      
      def initialize(left_operand, right_operand, predicate_or_hash, &block)
        super(&block)
        @left_operand, @right_operand = left_operand, right_operand
        @predicate = convert_to_predicate_if_needed(predicate_or_hash)
      end

      def column(name)
        left_operand.column(name) || right_operand.column(name)
      end

      protected

      def internal_sql_select_list(state)
        state[self][:internal_sql_select_list] ||=
          (left_operand.external_sql_select_list(state, self) + right_operand.external_sql_select_list(state, self)).map do |derived_column_or_asterisk|
            derived_column_or_asterisk.derive(state, self) do |derived_column|
              "#{derived_column.table_ref.name}__#{derived_column.name}"
            end
          end.flatten
      end

      def internal_sql_grouping_column_refs(state)
        []
      end

      def internal_sql_sort_specifications(state)
        state[self][:internal_sql_sort_specifications] ||=
          left_operand.external_sql_sort_specifications(state) + right_operand.external_sql_sort_specifications(state)
      end
    end
  end
end

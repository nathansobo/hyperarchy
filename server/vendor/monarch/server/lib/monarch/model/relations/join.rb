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

      def convert_hash_to_join_predicate_if_needed(predicate_or_hash)
        if predicate_or_hash.instance_of?(Hash)

          

        else
          predicate_or_hash
        end
      end

      def sql_set_quantifier
        :all
      end

      def sql_select_list
        (left_operand.sql_select_list + right_operand.sql_select_list).map do |derived_column_or_asterisk|
          derived_column_or_asterisk.derive(self) do |derived_column|
            "#{derived_column.table_ref.name}__#{derived_column.name}"
          end
        end.flatten
      end

      def sql_sort_specifications
        left_operand.sql_sort_specifications + right_operand.sql_sort_specifications
      end
    end
  end
end

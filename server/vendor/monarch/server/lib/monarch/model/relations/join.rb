module Model
  module Relations
    class Join < Relation

      protected

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
    end
  end
end

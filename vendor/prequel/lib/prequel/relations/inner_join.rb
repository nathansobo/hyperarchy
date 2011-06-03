module Prequel
  module Relations
    class InnerJoin < Join

      def wire_representation
        {
          "type" => "inner_join",
          "left_operand" => left.wire_representation,
          "right_operand" => right.wire_representation,
          "predicate" => predicate.wire_representation
        }
      end

      def pull_up_conditions
        new_left, left_conditions = left.extract_conditions
        new_right, right_conditions = right.extract_conditions
        new_predicate = (left_conditions + [predicate] + right_conditions).inject(:&)
        InnerJoin.new(new_left.pull_up_conditions, new_right.pull_up_conditions, new_predicate)
      end

      protected

      def table_ref_class
        Sql::InnerJoinedTableRef
      end
    end
  end
end

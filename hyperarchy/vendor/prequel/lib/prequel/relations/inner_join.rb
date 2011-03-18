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

      protected

      def table_ref_class
        Sql::InnerJoinedTableRef
      end
    end
  end
end

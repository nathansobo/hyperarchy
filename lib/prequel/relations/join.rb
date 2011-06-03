module Prequel
  module Relations
    class Join < Relation
      attr_reader :left, :right, :predicate

      def initialize(left_operand, right_operand, predicate=nil)
        @left, @right = left_operand.to_relation, right_operand.to_relation
        predicate = infer_predicate unless predicate
        @predicate = resolve(predicate.to_predicate)
      end

      def get_table(name)
        left.get_table(name) || right.get_table(name)
      end

      def columns
        (left.columns + right.columns).map do |column|
          derive(column)
        end
      end

      def visit(query)
        query.table_ref = table_ref(query)
      end

      def table_ref(query)
        table_ref_class.new(left.table_ref(query), right.singular_table_ref(query), predicate.resolve_in_query(query))
      end

      def infer_join_columns(columns)
        left.infer_join_columns(columns) || right.infer_join_columns(columns)
      end

      derive_equality :predicate, :left, :right

      protected

      def operands
        [left, right]
      end

      def infer_predicate
        columns = left.infer_join_columns(right.columns) || right.infer_join_columns(left.columns)
        raise "Could not infer join predicate" unless columns
        { columns[0] => columns[1] }
      end
    end
  end
end

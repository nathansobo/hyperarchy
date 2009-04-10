module Relations
  class Relation
    def where(predicate)
      Selection.new(self, predicate)
    end

    def join(right_operand)
      PartiallyConstructedInnerJoin.new(self, right_operand)
    end

    def project(projected_set)
      SetProjection.new(self, projected_set)
    end

    def find(id)
      where(tuple_class.id.eq(id)).tuples.first
    end

    def tuples
      Origin.read(tuple_class, to_sql)
    end

    class PartiallyConstructedInnerJoin
      attr_reader :left_operand, :right_operand
      def initialize(left_operand, right_operand)
        @left_operand, @right_operand = left_operand, right_operand
      end

      def on(predicate)
        InnerJoin.new(left_operand, right_operand, predicate)
      end
    end

  end
end
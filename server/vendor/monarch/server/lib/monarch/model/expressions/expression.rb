module Model
  module Expressions
    class Expression
      def derive(relation)
        DerivedColumn.new(relation, self, name)
      end
    end
  end
end
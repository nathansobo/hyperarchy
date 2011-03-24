module Prequel
  module Relations
    module UnaryRelationMethods
      delegate :create, :create!, :secure_create, :find_or_create, :new, :to => :operand

      protected

      def operands
        [operand]
      end
    end
  end
end
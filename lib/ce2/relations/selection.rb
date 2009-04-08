module Relations
  class Selection
    attr_reader :operand, :predicate

    def initialize(operand, predicate)
      @operand, @predicate = operand, predicate
    end
  end
end
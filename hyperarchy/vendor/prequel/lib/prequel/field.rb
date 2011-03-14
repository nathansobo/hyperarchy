module Prequel
  class Field
    attr_reader :tuple, :column
    attr_accessor :value

    def initialize(tuple, column)
      @tuple, @column = tuple, column
    end
  end
end
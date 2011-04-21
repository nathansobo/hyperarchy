module Prequel
  class SyntheticField
    attr_reader :tuple, :column
    delegate :name, :to => :column

    def initialize(tuple, column)
      @tuple, @column = tuple, column
    end

    def value=(value)
      tuple.send("#{name}=", column.normalize_field_value(value))
    end

    def value
      tuple.send(name)
    end

    def wire_representation
      column.convert_value_for_wire(value)
    end
  end
end

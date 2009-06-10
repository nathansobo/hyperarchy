module Model
  class Field
    attr_reader :tuple, :attribute, :value

    def initialize(tuple, attribute)
      @tuple, @attribute = tuple, attribute
    end

    def value=(value)
      @value = attribute.convert_value(value)
      tuple.dirty = true
    end

    def to_sql
      value.to_sql
    end
  end
end
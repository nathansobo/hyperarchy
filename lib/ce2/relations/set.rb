module Relations
  class Set
    attr_reader :global_name, :tuple_class, :attributes_by_name

    def initialize(global_name, tuple_class)
      @global_name, @tuple_class = global_name, tuple_class
      @attributes_by_name = {}
    end

    def define_attribute(name, type)
      attributes_by_name[name] = Attribute.new(self, name, type)
    end

    def attributes
      attributes_by_name.values
    end

    def insert(tuple)
      Origin.insert(global_name, tuple.field_values_by_attribute_name)
    end

    def create(field_values)
      insert(tuple_class.new(field_values))
    end
  end
end
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
  end
end
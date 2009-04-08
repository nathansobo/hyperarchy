module Relations
  class Set
    attr_reader :global_name, :tuple_class, :attributes_by_name

    def initialize(global_name, tuple_class)
      @global_name, @tuple_class = global_name, tuple_class
      @attributes_by_name = SequencedHash.new
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
      tuple = tuple_class.new(field_values)
      insert(tuple)
      tuple
    end

    def tuples
      Origin.read(tuple_class, to_sql)
    end

    def to_sql
      "select #{columns_sql} from #{global_name};"
    end

    def columns_sql
      attributes.map {|a| a.name}.join(", ")
    end

  end
end
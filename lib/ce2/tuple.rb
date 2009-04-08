class Tuple
  class << self
    attr_accessor :set

    def inherited(subclass)
      subclass.set = Domain.new_set(subclass.basename.underscore.pluralize.to_sym, subclass)
    end

    def attribute(name, type)
      attribute = set.define_attribute(name, type)

      define_method("#{name}=".to_sym) do |value|
        set_field_value(attribute, value)
      end

      define_method(name) do
        get_field_value(attribute)
      end

      metaclass.send(:define_method, name) do
        set.attributes_by_name[name]
      end
    end

    def basename
      name.split("::").last
    end

    delegate :create, :to => :set
  end

  attr_reader :fields_by_attribute


  def initialize(field_values = {})
    initialize_fields
    update(field_values)
  end

  def update(field_values)
    field_values.each do |attribute_name, value|
      set_field_value(set.attributes_by_name[attribute_name], value)
    end
  end

  def field_values_by_attribute_name
    fields_by_attribute.inject({}) do |result, attribute_field_pair|
      result[attribute_field_pair[0].name] = attribute_field_pair[1].value
      result
    end
  end

  def set_field_value(attribute, value)
    fields_by_attribute[attribute].value = value
  end

  def get_field_value(attribute)
    fields_by_attribute[attribute].value
  end

  def initialize_fields
    @fields_by_attribute = {}
    set.attributes.each do |attribute|
      fields_by_attribute[attribute] = Field.new(self, attribute)
    end
  end

  def set
    self.class.set
  end
end

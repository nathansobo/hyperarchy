module Prequel
  class Tuple
    class_attribute :relation

    class << self
      delegate :columns, :to => :relation

      def def_field_reader(name)
        define_method(name) do
          get_field_value(name)
        end
      end
    end

    def initialize(values = {})
      initialize_fields
      soft_update_fields(values)
    end

    delegate :columns, :to => :relation

    def soft_update_fields(values)
      values.each do |name, value|
        set_field_value(name, value)
      end
    end

    def get_field_value(name)
      fields_by_name[name].try(:value)
    end

    def field_values
      fields_by_name.inject({}) do |h, (name, field)|
        h[name] = field.value
        h
      end
    end

    def get_record(name)
      nil
    end

    delegate :inspect, :to => :field_values

    protected
    attr_reader :fields_by_name

    def initialize_fields
      @fields_by_name = {}
      columns.each do |column|
        fields_by_name[column.name] = Field.new(self, column)
      end
    end

    def set_field_value(name, value)
      field = fields_by_name[name]
      unless field
        raise "No field found #{name.inspect}"
      end
      field.value = value
    end
  end
end


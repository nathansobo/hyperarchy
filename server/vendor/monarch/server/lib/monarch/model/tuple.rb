module Model
  class Tuple
    class << self
      attr_reader :relation

      def relation=(relation)
        @relation = relation
        relation.concrete_columns.each { |column| define_field_reader(column) }
      end

      protected
      def define_field_reader(column)
        define_method(column.name) do
          get_field_value(column)
        end

        if column.instance_of?(ConcreteColumn) && column.type == :boolean
          define_method("#{column.name}?") do
            get_field_value(column)
          end
        end
      end
    end
    delegate :relation, :to => "self.class"
    delegate :column, :to => :relation

    def initialize(field_values)
      initialize_fields
      field_values.each do |projected_column_name, value|
        field(projected_column_name).value = value
      end
    end

    def get_field_value(column_or_name)
      field(column_or_name).value
    end

    def set_field_value(column_or_name, value)
      field(column_or_name).value = value
    end

    def [](column_index)
      field(column_index).value
    end

    def field(column_or_name)
      concrete_fields_by_column[column(column_or_name)]
    end

    def concrete_fields
      concrete_fields_by_column.values
    end

    def fields
      concrete_fields
    end

    def field_values_by_column_name
      concrete_fields_by_column.inject({}) do |result, column_field_pair|
        result[column_field_pair[0].name] = column_field_pair[1].value
        result
      end
    end

    def inspect
      field_values_by_column_name.inspect
    end

    def wire_representation
      wire_representation = {}
      fields.each do |field|
        wire_representation[field.name.to_s] = field.value_wire_representation
      end
      wire_representation
    end

    def validation_errors_by_column_name
      validate_if_needed
      validation_errors_by_column_name = {}
      fields.each do |field|
        validation_errors_by_column_name[field.name] = field.validation_errors unless field.valid?
      end
      validation_errors_by_column_name
    end

    def valid?
      true
    end

    protected
    attr_reader :concrete_fields_by_column
    def initialize_fields
      @concrete_fields_by_column = {}
      relation.concrete_columns.each do |column|
        concrete_fields_by_column[column] = ConcreteField.new(self, column)
      end
    end
  end
end

module Model
  class Tuple
    class << self
      attr_reader :relation

      def relation=(relation)
        @relation = relation
        relation.columns.each { |column| define_field_reader(column) }
      end

      protected
      def define_field_reader(column)
        define_method(column.name) do
          get_field_value(column)
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
      fields_by_column[column(column_or_name)]
    end

    def fields
      fields_by_column.values
    end

    def field_values_by_column_name
      fields_by_column.inject({}) do |result, column_field_pair|
        result[column_field_pair[0].name] = column_field_pair[1].value
        result
      end
    end

    def inspect
      field_values_by_column_name.inspect
    end

    def wire_representation
      wire_representation = {}
      fields_by_column.each do |column, field|
        wire_representation[column.name.to_s] = field.value_wire_representation
      end
      wire_representation
    end

    protected
    attr_reader :fields_by_column
    def initialize_fields
      @fields_by_column = {}
      relation.columns.each do |column|
        fields_by_column[column] = Field.new(self, column)
      end
    end
  end
end

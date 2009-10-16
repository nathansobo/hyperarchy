module Model
  class ProjectionRecord
    class << self
      attr_reader :projected_columns_by_name

      def projected_columns=(projected_columns)
        @projected_columns_by_name = {}

        projected_columns.each do |projected_column|
          projected_columns_by_name[projected_column.name] = projected_column
          define_method("#{projected_column.name}") do
            fields_by_projected_column[projected_column].value
          end
        end
      end
    end

    attr_reader :fields_by_projected_column
    delegate :projected_columns_by_name, :to => "self.class"

    def initialize(field_values)
      initialize_fields
      field_values.each do |projected_column_name, value|

        p projected_column_name unless field(projected_column_name)


        field(projected_column_name).value = value
      end
    end

    def initialize_fields
      @fields_by_projected_column = {}
      projected_columns_by_name.each do |name, projected_column|
        fields_by_projected_column[projected_column] = Field.new(self, projected_column)
      end
    end

    def field(projected_column_or_name)
      if projected_column_or_name.instance_of?(ProjectedColumn)
        fields_by_projected_column[projected_column_or_name]
      else
        fields_by_projected_column[projected_columns_by_name[projected_column_or_name]]
      end
    end

    def wire_representation
      wire_representation = {}
      fields_by_projected_column.each do |column, field|
        wire_representation[column.name.to_s] = field.value_wire_representation
      end
      wire_representation
    end
  end
end

module Monarch
  module Model
    module Tuples
      class Tuple
        class << self
          attr_reader :relation

          def relation=(relation)
            @relation = relation
            relation.concrete_columns.each { |column| define_field_reader(column) }
          end

          protected
          def define_field_reader(column)
            return unless column.name
            define_method(column.name) do
              get_field_value(column)
            end

            if column.instance_of?(Expressions::ConcreteColumn) && column.type == :boolean
              define_method("#{column.name}?") do
                get_field_value(column)
              end
            end
          end
        end
        delegate :relation, :to => "self.class"
        delegate :column, :columns, :to => :relation

        def initialize(field_values)
          initialize_fields
          field_values.each do |column_name, value|
            field = field(column_name)
            raise "No field found for column name #{column_name}" unless field
            field.value = value
          end
        end

        def get_field_value(column_or_name)
          field = field(column_or_name)
          raise "No field found: #{column_or_name.inspect} on record #{inspect}" unless field
          field.value
        end

        def set_field_value(column_or_name, value)
          field = field(column_or_name)
          raise "No field found for column #{column_or_name}" unless field
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

          permitted_column_names.each do |column_name|
            wire_representation[column_name.to_s] = field(column_name).value_wire_representation
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

        def validation_errors
          fields.map do |field|
            field.validation_errors
          end.flatten
        end

        def valid?
          true
        end

        def hash
          @hash ||= field_values_by_column_name.hash
        end

        def ==(other)
          return true if equal?(other)
          hash == other.hash
        end

        def evaluate(term)
          if term.is_a?(Expressions::Column)
            field(term).value
          elsif term.is_a?(Field)
            term.value
          else
            term
          end
        end

        def add_to_relational_dataset(dataset)
          dataset[exposed_name.to_s] ||= {}
          dataset[exposed_name.to_s][id] = wire_representation
        end

        def exposed_name
          relation.exposed_name
        end

        def permitted_column_names
          read_whitelist - read_blacklist
        end

        def read_whitelist
          columns.map(&:name)
        end

        def read_blacklist
          []
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
  end
end
module Model
  class Record
    class << self
      include ForwardsArrayMethodsToRecords

      attr_accessor :table
      def inherited(subclass)
        subclass.table = Repository.new_table(subclass.basename.underscore.pluralize.to_sym, subclass)
        subclass.column(:id, :string)
      end

      def column(name, type)
        column = table.define_column(name, type)

        define_method("#{name}=".to_sym) do |value|
          set_field_value(column, value)
        end

        define_method(name) do
          get_field_value(column)
        end
      end

      def [](column_name)
        raise "Column #{column_name} not found" unless table.columns_by_name.has_key?(column_name)
        table.columns_by_name[column_name]
      end

      def relates_to_many(relation_name, &definition)
        relation_definitions[relation_name] = definition
        define_method(relation_name) do
          relations_by_name[relation_name]
        end
      end

      def relates_to_one(relation_name, &definition)
        relation_definitions[relation_name] = definition
        define_method relation_name do
          relations_by_name[relation_name].records.first
        end
      end

      def has_many(relation_name)
        relates_to_many(relation_name) do
          target_class = relation_name.to_s.singularize.classify.constantize
          foreign_key_column = target_class["#{self.class.basename.underscore}_id".to_sym]
          target_class.where(foreign_key_column.eq(id))
        end
      end

      def belongs_to(relation_name)
        relates_to_one(relation_name) do
          target_class = relation_name.to_s.classify.constantize
          foreign_key_field = self.fields_by_column[self.class["#{relation_name}_id".to_sym]]
          target_class.where(target_class[:id].eq(foreign_key_field))
        end
      end

      def unsafe_new(field_values = {})
        record = allocate
        record.unsafe_initialize(field_values)
        record
      end

      def basename
        name.split("::").last
      end

      def relation_definitions
        @relation_definitions ||= ActiveSupport::OrderedHash.new
      end

      delegate :create, :where, :project, :join, :find, :columns_by_name,
               :create_table, :drop_table, :clear_table, :records, :find_or_create,
               :to => :table
    end

    attr_reader :fields_by_column, :relations_by_name
    attr_writer :dirty
    delegate :table, :to => "self.class"

    def initialize(field_values = {})
      unsafe_initialize(field_values.merge(:id => Guid.new.to_s))
      @dirty = true
    end

    def unsafe_initialize(field_values)
      initialize_fields
      update(field_values)
      @dirty = false
      initialize_relations
    end

    def reload
      Origin.reload(self)
    end

    def update(values_by_method_name)
      values_by_method_name.each do |method_name, value|
        writer_method_name = "#{method_name}="
        self.send(writer_method_name, value) if self.respond_to?(writer_method_name)
      end
      dirty_field_values_by_column_name
    end

    def update_fields(field_values_by_column_name)
      field_values_by_column_name.each do |column_name, value|
        self.field(column_name).value = value
      end
      dirty_field_values_by_column_name
    end

    def save
      Origin.update(table, field_values_by_column_name)
      mark_clean
    end

    def dirty?
      fields.any? {|field| field.dirty?}
    end

    def mark_clean
      fields.each { |field| field.mark_clean }
    end

    def field_values_by_column_name
      fields_by_column.inject({}) do |result, column_field_pair|
        result[column_field_pair[0].name] = column_field_pair[1].value
        result
      end
    end

    def dirty_field_values_by_column_name
      dirty_fields.inject({}) do |field_values, field|
        field_values[field.column.name] = field.value_wire_representation
        field_values
      end
    end

    def fields
      fields_by_column.values
    end

    def dirty_fields
      fields.select { |field| field.dirty? }
    end

    def field(column)
      case column
      when String, Symbol
        fields_by_column[table.column(column)]
      when Column
        fields_by_column[column]
      end
    end

    def wire_representation
      wire_representation = {}
      fields_by_column.each do |column, field|
        wire_representation[column.name.to_s] = field.value_wire_representation
      end
      wire_representation
    end

    def set_field_value(column, value)
      field(column).value = value
    end

    def get_field_value(column)
      field(column).value
    end

    def initialize_fields
      @fields_by_column = {}
      table.columns.each do |column|
        fields_by_column[column] = Field.new(self, column)
      end
    end

    def initialize_relations
      @relations_by_name = {}
      self.class.relation_definitions.each do |relation_name, definition|
        relations_by_name[relation_name] = instance_eval(&definition)
      end
    end

    def table
      self.class.table
    end

    def ==(other)
      other.class == self.class && id == other.id
    end

    def resolve_table_name(name)
      relation = relations_by_name[name.to_sym]
      raise "No relation with name #{name} found on #{inspect}" unless relation
      relation
    end

    def inspect
      field_values_by_column_name.inspect
    end
  end
end

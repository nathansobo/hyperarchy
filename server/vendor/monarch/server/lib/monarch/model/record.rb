module Model
  class Record < Tuple
    class << self
      include ForwardsArrayMethodsToRecords

      attr_accessor :table
      def inherited(subclass)
        subclass.relation = Repository.new_table(subclass.basename.underscore.pluralize.to_sym, subclass)
        subclass.column(:id, :string)
      end

      def table
        relation
      end

      def column(name, type, options={})
        column = table.define_concrete_column(name, type, options)
        define_field_writer(column)
        define_field_reader(column)
      end

      def synthetic_column(name, type, &signal_definition)
        column = table.define_synthetic_column(name, type, signal_definition)
        define_field_reader(column)
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
          relations_by_name[relation_name].all.first
        end
      end

      def has_many(relation_name, &block)
        relates_to_many(relation_name) do
          target_class = relation_name.to_s.singularize.classify.constantize
          foreign_key_column = target_class["#{self.class.basename.underscore}_id".to_sym]
          target_class.where(foreign_key_column.eq(id), &block)
        end
      end

      def belongs_to(relation_name)
        relates_to_one(relation_name) do
          target_class = relation_name.to_s.classify.constantize
          foreign_key_field = self.concrete_fields_by_column[self.class["#{relation_name}_id".to_sym]]
          target_class.where(target_class[:id].eq(foreign_key_field))
        end
      end

      def unsafe_new(field_values = {})
        record = allocate
        record.unsafe_initialize(field_values)
        record
      end

      def relation_definitions
        @relation_definitions ||= ActiveSupport::OrderedHash.new
      end

      delegate :create, :where, :project, :join, :join_through, :find, :concrete_columns_by_name, :[],
               :create_table, :drop_table, :clear_table, :all, :find_or_create,
               :to => :table

      protected
      def define_field_writer(column)
        define_method("#{column.name}=") do |value|
          set_field_value(column, value)
        end
      end
    end

    attr_reader :relations_by_name
    delegate :table, :to => "self.class"

    def initialize(field_values = {})
      unsafe_initialize(default_field_values.merge(field_values).merge(:id => Guid.new.to_s))
    end

    def unsafe_initialize(field_values)
      initialize_fields
      update(field_values)
      initialize_relations
    end

    def activate
      table.global_identity_map[id] = self
    end

    def reload
      Origin.reload(self)
      self
    end

    def update(values_by_method_name)
      values_by_method_name.each do |method_name, value|
        writer_method_name = "#{method_name}="
        self.send(writer_method_name, value) if self.respond_to?(writer_method_name)
      end
      dirty_field_values_wire_representation
    end

    def update_fields(field_values_by_column_name)
      field_values_by_column_name.each do |column_name, value|
        field = self.field(column_name)
        field.value = value if field
      end
      dirty_field_values_wire_representation
    end

    def destroy
      table.remove(self)
      after_destroy
    end

    def save
      return false unless valid?
      return true unless dirty?
      Origin.update(table, id, dirty_concrete_field_values_by_column_name)
      changeset = dirty_concrete_field_values_by_column_name
      mark_clean
      after_update(changeset)
      true
    end

    def dirty?
      concrete_fields.any? {|field| field.dirty?}
    end

    def mark_clean
      fields.each { |field| field.mark_clean }
    end

    def dirty_field_values_wire_representation
      dirty_fields.inject({}) do |field_values, field|
        field_values[field.column.name] = field.value_wire_representation
        field_values
      end
    end

    def dirty_concrete_field_values_by_column_name
      dirty_concrete_fields.inject({}) do |field_values, field|
        field_values[field.column.name] = field.value
        field_values
      end
    end

    def dirty_concrete_fields
      concrete_fields.select { |field| field.dirty? }
    end

    def dirty_fields
      fields.select { |field| field.dirty? }
    end

    def ==(other)
      other.class == self.class && id == other.id
    end

    def fields
      super + synthetic_fields
    end

    def field(column_or_name)
      super(column_or_name) || synthetic_fields_by_column[column(column_or_name)]
    end

    def signal(column_or_name, &block)
      field(column_or_name).signal(&block)
    end

    def synthetic_fields
      synthetic_fields_by_column.values
    end

    def valid?
      validate_if_needed
      fields.each do |field|
        return false unless field.valid?
      end
      true
    end

    def validate_if_needed
      return if validated?
      validate
      mark_validated
    end

    def validated?
      fields.all? {|field| field.validated?}
    end

    def mark_validated
      fields.each { |field| field.mark_validated }
    end

    def validate
      # implement in subclasses if validation is desired
    end

    def validation_error(field_name, error_string)
      field(field_name).validation_errors.push(error_string)
    end

    protected
    attr_reader :synthetic_fields_by_column

    def after_destroy
      # override when needed
    end

    def after_update(changeset)
      # override when needed
    end

    def initialize_relations
      @relations_by_name = {}
      self.class.relation_definitions.each do |relation_name, definition|
        relations_by_name[relation_name] = instance_eval(&definition)
      end
    end

    def default_field_values
      defaults = {}
      table.concrete_columns.each do |column|
        defaults[column.name] = column.default_value unless column.default_value.nil?
      end
      defaults
    end

    def initialize_fields
      super
      @synthetic_fields_by_column = {}
      relation.synthetic_columns.each do |column|
        synthetic_fields_by_column[column] = SyntheticField.new(self, column, instance_eval(&column.signal_definition))
      end
    end
  end
end

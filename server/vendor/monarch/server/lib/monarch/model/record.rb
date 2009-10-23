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
        column = table.define_column(name, type, options)
        define_field_writer(column)
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
          foreign_key_field = self.fields_by_column[self.class["#{relation_name}_id".to_sym]]
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

      delegate :create, :where, :project, :join, :find, :columns_by_name, :[],
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

    def reload
      Origin.reload(self)
      self
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

    def destroy
      Origin.destroy(table, id)
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

    def dirty_field_values_by_column_name
      dirty_fields.inject({}) do |field_values, field|
        field_values[field.column.name] = field.value_wire_representation
        field_values
      end
    end

    def dirty_fields
      fields.select { |field| field.dirty? }
    end

    def ==(other)
      other.class == self.class && id == other.id
    end

    protected
    def initialize_relations
      @relations_by_name = {}
      self.class.relation_definitions.each do |relation_name, definition|
        relations_by_name[relation_name] = instance_eval(&definition)
      end
    end

    def default_field_values
      defaults = {}
      table.columns.each do |column|
        defaults[column.name] = column.default_value if column.default_value
      end
      defaults
    end
  end
end

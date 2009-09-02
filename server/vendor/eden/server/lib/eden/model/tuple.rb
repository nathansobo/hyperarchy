module Model
  class Tuple
    class << self
      include ForwardsArrayMethodsToTuples

      attr_accessor :set
      def inherited(subclass)
        subclass.set = GlobalDomain.new_set(subclass.basename.underscore.pluralize.to_sym, subclass)
        subclass.column(:id, :string)
      end

      def column(name, type)
        column = set.define_column(name, type)

        define_method("#{name}=".to_sym) do |value|
          set_field_value(column, value)
        end

        define_method(name) do
          get_field_value(column)
        end
      end

      def [](column_name)
        raise "Column #{column_name} not found" unless set.columns_by_name.has_key?(column_name)
        set.columns_by_name[column_name]
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
          relations_by_name[relation_name].tuples.first
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
        tuple = allocate
        tuple.unsafe_initialize(field_values)
        tuple
      end

      def basename
        name.split("::").last
      end

      def fixtures(declared_fixtures)
        set.declared_fixtures = declared_fixtures
      end

      def relation_definitions
        @relation_definitions ||= ActiveSupport::OrderedHash.new
      end

      delegate :create, :where, :project, :join, :find, :columns_by_name,
               :create_table, :drop_table, :clear_table, :tuples,
               :to => :set
    end

    include Domain
    attr_reader :fields_by_column, :relations_by_name
    attr_writer :dirty


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

    def update(field_values)
      field_values.each do |column_name, value|
        self.send("#{column_name}=", value)
      end
    end

    def save
      Origin.update(set, field_values_by_column_name)
      @dirty = false
    end

    def dirty?
      @dirty
    end

    def field_values_by_column_name
      fields_by_column.inject({}) do |result, column_field_pair|
        result[column_field_pair[0].name] = column_field_pair[1].value
        result
      end
    end

    def wire_representation
      field_values_by_column_name.stringify_keys
    end

    def set_field_value(column, value)
      fields_by_column[column].value = value
    end

    def get_field_value(column)
      fields_by_column[column].value
    end

    def initialize_fields
      @fields_by_column = {}
      set.columns.each do |column|
        fields_by_column[column] = Field.new(self, column)
      end
    end

    def initialize_relations
      @relations_by_name = {}
      self.class.relation_definitions.each do |relation_name, definition|
        relations_by_name[relation_name] = instance_eval(&definition)
      end
    end

    def set
      self.class.set
    end

    def ==(other)
      other.class == self.class && id == other.id
    end

    def resolve_named_relation(name)
      relation = relations_by_name[name.to_sym]
      raise "No relation with name #{name} found on #{inspect}" unless relation
      relation
    end

    def inspect
      field_values_by_column_name.inspect
    end
  end
end

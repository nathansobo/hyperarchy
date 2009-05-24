module Model
  class Tuple
    class << self
      include ForwardsArrayMethodsToTuples

      attr_accessor :set
      def inherited(subclass)
        subclass.set = GlobalDomain.new_set(subclass.basename.underscore.pluralize.to_sym, subclass)
        subclass.attribute(:id, :string)
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
        @relation_definitions ||= SequencedHash.new
      end

      delegate :create, :where, :project, :join, :find, :attributes_by_name, :tuples, :to => :set
    end

    include Domain
    attr_reader :fields_by_attribute, :relations_by_name


    def initialize(field_values = {})
      unsafe_initialize(field_values.merge(:id => Guid.new.to_s))
    end

    def unsafe_initialize(field_values)
      initialize_fields
      update(field_values)
      initialize_relations
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

    def wire_representation
      field_values_by_attribute_name.stringify_keys
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
  end
end
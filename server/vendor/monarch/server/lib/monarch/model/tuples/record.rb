module Monarch
  module Model
    module Tuples
      class Record < Tuple
        class << self
          include ForwardsArrayMethodsToRecords

          attr_accessor :table
          def inherited(subclass)
            subclass.relation = Repository.new_table(subclass.basename.underscore.pluralize.to_sym, subclass)
            subclass.column(:id, :key)
          end

          def table
            relation
          end

          def guid_primary_key
            self[:id].type = :string
            @guid_primary_key = true
          end

          def guid_primary_key?
            !@guid_primary_key.nil?
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

          def has_many(relation_name, options={}, &block)
            relates_to_many(relation_name) do
              target_class = options[:class_name] ?
                options[:class_name].constantize :
                relation_name.to_s.singularize.classify.constantize

              foreign_key_column = target_class["#{self.class.basename.underscore}_id".to_sym]
              relation = target_class.where(foreign_key_column.eq(field(:id)), &block)
              relation = relation.order_by(*options[:order_by]) if options[:order_by]
              relation
            end
          end

          def belongs_to(relation_name, options={})
            foreign_key_name = "#{relation_name}_id".to_sym
            relates_to_one(relation_name) do
              target_class = options[:class_name] ? options[:class_name].constantize : relation_name.to_s.classify.constantize
              foreign_key_field = self.concrete_fields_by_column[self.class[foreign_key_name]]
              target_class.where(target_class[:id].eq(foreign_key_field))
            end
            define_method "#{relation_name}=" do |record|
              send("#{foreign_key_name}=", record ? record.id : nil)
            end
          end

          def validates_uniqueness_of(column_name, options={})
            column = table.column(column_name)
            raise "No column #{column_name.inspect} to validate the uniqueness of" unless column
            validate do
              field = field(column)
              raise "No field found for column #{column}" unless field
              field_value = field.value
              relation = table.where(column => field_value)
              relation = relation.where(column(:id).neq(id)) if persisted?
              unless relation.empty?
                validation_error(column_name, options[:message] || "#{column_name.to_s.humanize} must be unique")
              end
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

          def validate(&block)
            self.validations.push(block)
          end

          def validations
            @validations ||= []
          end

          delegate :create, :create!, :unsafe_create, :where, :project, :join, :join_to, :join_through, :aggregate, :order_by,
                   :find, :size, :concrete_columns_by_name, :[], :create_table, :drop_table, :clear_table, :all, :find_or_create,
                   :left_join, :left_join_to, :group_by, :offset, :limit, :on_insert, :on_remove, :on_update, :to => :table

          protected
          def define_field_writer(column)
            define_method("#{column.name}=") do |value|
              set_field_value(column, value)
            end
          end
        end

        attr_reader :relations_by_name
        delegate :table, :validations, :to => "self.class"
        delegate :current_user, :to => "::Monarch::Model::Repository"

        def initialize(field_values = {})
          field_values.delete(:id)
          unsafe_initialize(default_field_values.merge(field_values))
        end

        def unsafe_initialize(field_values)
          initialize_fields
          soft_update(field_values)
          initialize_relations
        end

        def activate
          table.global_identity_map[id] = self
        end

        def reload(*columns)
          Origin.reload(self, *columns)
          self
        end

        def update(values_by_method_name)
          soft_update(values_by_method_name)
          save
        end

        def update!(values_by_method_name)
          update(values_by_method_name).tap do
            raise InvalidRecordException.new(self, validation_errors_by_column_name) unless valid?
          end
        end

        def update_fields(field_values_by_column_name)
          field_values_by_column_name.each do |column_name, value|
            field = self.field(column_name)
            field.value = value if field
          end
          save
        end

        def destroy
          before_destroy
          table.remove(self)
          after_destroy
        end

        def save
          unless persisted?
            record = table.insert(self)
            if record.valid?
              return record
            else
              return false
            end
          end

          return self unless dirty?

          before_update(dirty_concrete_field_values_by_column_name)
          return false unless valid?

          self.updated_at = Time.now if column(:updated_at)
          field_values_for_database = dirty_concrete_field_values_by_column_name

          old_state = snapshot
          Origin.update(table, id, field_values_for_database)
          mark_clean
          new_state = snapshot
          changeset = Changeset.new(self, new_state, old_state)
          table.record_updated(self, changeset)
          after_update(changeset)

          self
        end

        def increment(column, count=1)
          old_state = snapshot
          table.where(:id => id).increment(column, count)
          reload(column)
          new_state = snapshot
          table.record_updated(self, Changeset.new(self, new_state, old_state))
        end

        def decrement(column, count=1)
          increment(column, -count)
        end

        def dirty?
          concrete_fields.any? {|field| field.dirty?}
        end

        def persisted?
          @persisted
        end

        def mark_clean
          @persisted = true
          fields.each { |field| field.mark_clean }
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
          before_validate
          validate_wire_representation
          execute_validation_hooks
          validate
          mark_validated
        end

        def validated?
          fields.all? {|field| field.validated?}
        end

        def mark_validated
          fields.each { |field| field.mark_validated }
        end

        def validate_wire_representation
          fields.each do |field|
            begin
              field.value_wire_representation.to_json
            rescue JSON::GeneratorError
              validation_error(field.name, "text contains one or more illegal (non-unicode) characters")
            rescue => e
              validation_error(field.name, "unexpected error: #{e}")
            end
          end
        end

        def execute_validation_hooks
          validations.each do |validation|
            instance_eval(&validation)
          end
        end

        def validate
          # implement in subclasses if validation is desired
        end

        def validation_error(field_name, error_string)
          field(field_name).validation_errors.push(error_string)
        end

        def snapshot
          snapshot = self.class.new
          synthetic_fields_by_column.each do |column, field|
            snapshot.instance_eval do
              synthetic_fields_by_column[column] = field.snapshot
            end
          end
          concrete_fields_by_column.each do |column, field|
            snapshot.instance_eval do
              concrete_fields_by_column[column] = field.snapshot
            end
          end
          snapshot
        end

        def [](index_or_table)
          if index_or_table.instance_of?(Relations::Table)
            return self if index_or_table == table
          else
            super
          end
        end

        def hash
          object_id.hash
        end

        def constituent_records
          [self]
        end

        def ==(other)
          return false unless self.class == other.class
          super
        end

        def soft_update(values_by_method_name)
          values_by_method_name.each do |method_name, value|
            writer_method_name = "#{method_name}="
            self.send(writer_method_name, value) if self.respond_to?(writer_method_name)
          end
          self
        end

        def soft_update_fields(values_by_field_name, include_dirty=true, mark_clean=false)
          values_by_field_name.each do |field_name, value|
            if the_field = field(field_name)
              the_field.value = value if !the_field.dirty? || include_dirty
              the_field.mark_clean if mark_clean
            end
          end
          self
        end

        def soft_update_clean_fields(values_by_field_name)
          soft_update_fields(values_by_field_name, false)
        end

        def update_fields_from_remote(values_by_field_name)
          soft_update_fields(values_by_field_name, true, true)
        end

        def lock
          table.lock(id)
        end

        def unlock
          table.unlock(id)
        end

        def synchronize
          lock
          yield
          unlock
        end

        ## Hooks - Override when needed
        def before_create
        end

        def after_create
        end

        def before_destroy
        end

        def after_destroy
        end

        def before_validate
        end

        def before_update(changeset)
        end

        def after_update(changeset)
        end

        def can_create?
          true
        end

        def can_create_with_columns?(columns)
          permitted_columns = create_whitelist - create_blacklist
          (columns.map(&:to_sym) - permitted_columns).empty?
        end

        def can_update?
          true
        end

        def can_update_columns?(columns)
          permitted_columns = update_whitelist - update_blacklist
          (columns.map(&:to_sym) - permitted_columns).empty?
        end

        def can_destroy?
          true
        end


        def whitelist
          columns.map(&:name)
        end

        def blacklist
          []
        end

        def create_whitelist
          whitelist
        end

        def create_blacklist
          blacklist
        end

        def update_whitelist
          whitelist
        end

        def update_blacklist
          blacklist
        end

        protected
        attr_reader :synthetic_fields_by_column

        def initialize_relations
          @relations_by_name = {}
          self.class.relation_definitions.each do |relation_name, definition|
            relations_by_name[relation_name] = instance_eval(&definition)
          end
        end

        def default_field_values
          defaults = self.class.guid_primary_key?? { :id => Guid.new.to_s } : {}
          table.concrete_columns.each do |column|
            defaults[column.name] = column.default_value unless column.default_value.nil?
          end
          defaults
        end

        def initialize_fields
          super
          @synthetic_fields_by_column = {}
          relation.synthetic_columns.each do |column|
            synthetic_fields_by_column[column] = SyntheticField.new(self, column)
          end
        end
      end
    end

    Record = Tuples::Record
  end
end

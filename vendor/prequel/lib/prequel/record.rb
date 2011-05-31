module Prequel
  class Record < Tuple
    class << self
      delegate :all, :update, :dataset, :count, :[], :to_update_sql, :to_sql, :get_column, :first, :empty?, :find,
               :clear, :where, :where_any, :join, :join_through, :left_join, :project, :group_by, :order_by, :limit,
               :offset, :tables, :synthetic_columns, :wire_representation, :each, :each_with_index, :map,
               :to => :relation

      def table
        relation
      end

      def to_relation
        relation
      end

      def inherited(klass)
        table_name = klass.name.demodulize.underscore.pluralize.to_sym
        Prequel.record_classes.push(klass)
        klass.relation = Relations::Table.new(table_name, klass)
      end

      def def_field_accessor(name)
        def_field_reader(name)
        def_field_writer(name)
      end

      def def_field_writer(name)
        define_method("#{name}=") do |value|
          set_field_value(name, value)
        end
      end

      def def_predicate(name)
        define_method("#{name}?") do
          get_field_value(name)
        end
      end

      def column(name, type, options = {})
        table.def_column(name, type, options)
        def_field_accessor(name)
        def_predicate(name) if type == :boolean
      end

      def synthetic_column(name, type)
        table.def_synthetic_column(name, type)
      end

      def validate(&block)
        validations.push(block)
      end

      def validations
        @validations ||= []
      end

      def new_from_database(attributes)
        Prequel.session[table.name][attributes[:id]] ||= super
      end

      def create(attributes={})
        new(attributes).tap(&:save)
      end

      def create!(attributes={})
        new(attributes).tap(&:save!)
      end

      def secure_create(attributes={})
        if record = secure_new(attributes)
          record.tap(&:save)
        else
          false
        end
      end

      def secure_new(attributes={})
        allocate.secure_initialize(attributes)
      end

      def has_many(name, options = {})
        class_name = options[:class_name] || name.to_s.singularize.camelize
        define_method name do
          klass = class_name.constantize
          foreign_key = options[:foreign_key] || table.infer_join_columns(klass.columns)[1]
          relation = klass.where(foreign_key => id)
          if options[:order_by]
            relation.order_by(*options[:order_by])
          else
            relation
          end
        end
      end

      def belongs_to(name, options = {})
        class_name = options[:class_name] || name.to_s.camelize
        foreign_key_name = "#{name}_id"
        klass = class_name.constantize
        define_method name do
          parent_id = send(foreign_key_name)
          klass.find(parent_id)
        end

        define_method "#{name}=" do |record|
          send("#{foreign_key_name}=", record.try(:id))
        end
      end

      def on_create(&proc)
        on_create_node.subscribe(&proc)
      end

      def on_update(&proc)
        on_update_node.subscribe(&proc)
      end

      def on_destroy(&proc)
        on_destroy_node.subscribe(&proc)
      end

      def on_create_node
        Prequel.get_subscription_node(self, :on_create)
      end

      def on_update_node
        Prequel.get_subscription_node(self, :on_update)
      end

      def on_destroy_node
        Prequel.get_subscription_node(self, :on_destroy)
      end
    end

    include Comparable
    delegate :synthetic_columns, :to => 'self.class'
    delegate :get_column, :to => :table

    def initialize(values={})
      super(default_field_values.merge(values))
    end

    def secure_initialize(values={})
      return false unless can_create?
      initialize(values.slice(*create_whitelist - create_blacklist))
      self
    end

    def table
      relation
    end

    public :set_field_value

    def soft_update(attributes)
      attributes.each do |name, value|
        set_field_value(name, value)
      end
    end

    def update(attributes)
      soft_update(attributes)
      save
    end

    def update!(attributes)
      soft_update(attributes)
      save!
    end

    def secure_update(attributes)
      return false unless can_update?
      soft_update(attributes.slice(*update_whitelist - update_blacklist))
      save
    end

    def destroy
      Prequel.transaction do
        before_destroy
        DB[table.name].filter(:id => id).delete
        Prequel.session[table.name].delete(id)
        after_destroy
        Prequel.session.handle_destroy_event(self)
      end
    end

    def secure_destroy
      return false unless can_destroy?
      destroy
    end

    def save
      return false unless valid?
      return true unless dirty?
      Prequel.transaction do
        if persisted?
          initial_changeset = build_changeset
          before_update(initial_changeset)
          before_save
          self.updated_at = Time.now if fields_by_name.has_key?(:updated_at)
          dirty_fields = dirty_field_values
          final_changeset = build_changeset
          table.where(:id => id).update(dirty_fields) unless dirty_fields.empty?
          mark_clean
          after_update(final_changeset)
          after_save
          Prequel.session.handle_update_event(self, final_changeset)
        else
          before_create
          before_save
          self.created_at = Time.now if fields_by_name.has_key?(:created_at)
          self.updated_at = Time.now if fields_by_name.has_key?(:updated_at)
          self.id = (DB[table.name] << field_values_without_id)
          Prequel.session[table.name][id] = self
          mark_clean
          after_create
          after_save
          Prequel.session.handle_create_event(self)
        end
      end
      true
    end

    def save!
      if save
        true
      else
        raise NotValid
      end
    end

    def increment(field_name, count=1)
      table.where(:id => id).increment(field_name, count)
      reload(field_name)
    end

    def decrement(field_name, count=1)
      table.where(:id => id).decrement(field_name, count)
      reload(field_name)
    end

    def mark_clean
      @persisted = true
      super
    end

    def dirty?
      unpersisted? || super
    end

    def persisted?
      @persisted
    end

    def unpersisted?
      !persisted?
    end

    def valid?
      errors.clear
      run_validations
      validate
      errors.empty?
    end

    def errors
      @errors ||= Sequel::Model::Errors.new
    end
    
    def validate; end

    def reload(*columns)
      field_values = columns.empty??
        table.where(:id => id).dataset.first :
        table.where(:id => id).project(*columns).dataset.first
      soft_update_fields(field_values, true)
      self
    end

    def get_record(table_name)
      self if table_name == table.name
    end

    def synthetic_field_values
      synthetic_columns.inject({}) do |hash, column|
        hash[column.name] = send(column.name)
        hash
      end
    end

    def all_fields
      fields_by_name.merge(synthetic_fields_by_name)
    end

    def to_param
      id.to_s
    end

    def wire_representation
      Hash[all_fields.slice(*read_whitelist - read_blacklist).map do |name, field|
        [name.to_s, field.wire_representation]
      end]
    end

    def add_to_client_dataset(dataset)
      dataset[table.name.to_s][to_param] ||= wire_representation
    end

    def <=>(other)
      id <=> other.id
    end

    class NotValid < Exception; end;

    protected
    attr_reader :synthetic_fields_by_name

    def before_save; end
    def after_save; end

    def before_create; end
    def after_create; end

    def before_update(changeset); end
    def after_update(changeset); end

    def before_destroy; end
    def after_destroy; end

    def run_validations
      self.class.validations.each do |validation|
        instance_eval(&validation)
      end
    end

    def default_field_values
      columns.inject({}) do |hash, column|
        hash[column.name] = column.default_value if column.has_default?
        hash
      end
    end

    def build_changeset
      Changeset.new(self).tap do |changeset|
        fields.each do |field|
          field.update_changeset(changeset)
        end
      end
    end

    def can_mutate?
      true
    end

    def can_create?
      can_mutate?
    end

    def can_update?
      can_mutate?
    end

    def global_whitelist
      columns.map(&:name) + synthetic_columns.map(&:name)
    end

    def global_blacklist
      []
    end

    def read_whitelist
      global_whitelist
    end

    def read_blacklist
      global_blacklist
    end

    def mutate_whitelist
      global_whitelist
    end

    def mutate_blacklist
      global_blacklist
    end

    def create_whitelist
      mutate_whitelist
    end

    def create_blacklist
      mutate_blacklist
    end

    def update_whitelist
      mutate_whitelist
    end

    def update_blacklist
      mutate_blacklist
    end

    def readable_fields
      read_whitelist - read_blacklist
    end

    def initialize_fields
      super
      @synthetic_fields_by_name = {}
      synthetic_columns.each do |column|
        synthetic_fields_by_name[column.name] = SyntheticField.new(self, column)
      end
    end

    def get_field(name)
      name = name.to_sym
      field = fields_by_name[name] ||  synthetic_fields_by_name[name]
    end

    def field_values_without_id
      field_values.tap do |field_values|
        field_values.delete(:id)
      end
    end
  end
end

module Prequel
  class Record < Tuple
    class << self
      delegate :all, :update, :dataset, :count, :[], :to_update_sql, :to_sql, :get_column, :first, :find, :clear,
               :where, :join, :join_through, :left_join, :project, :group_by, :order_by, :limit, :offset, :tables,
               :synthetic_columns, :wire_representation, :to => :relation

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
          foreign_key = table.infer_join_columns(klass.columns)[1]
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
    end

    delegate :synthetic_columns, :to => 'self.class'

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
        self.send("#{name}=", value)
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
      DB[table.name].filter(:id => id).delete
      Prequel.session[table.name].delete(id)
    end

    def secure_destroy
      return false unless can_destroy?
      destroy
    end

    def save
      return false unless valid?
      if id
        before_update
        before_save
        dirty_fields = dirty_field_values
        table.where(:id => id).update(dirty_fields) unless dirty_fields.empty?
        after_update
        after_save
      else
        before_create
        before_save
        self.id = (DB[table.name] << field_values_without_id)
        Prequel.session[table.name][id] = self
        after_create
        after_save
      end
      mark_clean
      true
    end

    def save!
      if save
        true
      else
        raise NotValid
      end
    end

    def valid?
      errors.clear
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

    def to_param
      id.to_s
    end

    def wire_representation
      field_values.merge(synthetic_field_values).slice(*read_whitelist - read_blacklist).stringify_keys
    end

    def add_to_client_dataset(dataset)
      dataset[table.name.to_s][to_param] ||= wire_representation
    end

    class NotValid < Exception; end;

    protected

    def before_save; end
    def after_save; end

    def before_create; end
    def after_create; end

    def before_update; end
    def after_update; end

    def default_field_values
      columns.inject({}) do |hash, column|
        hash[column.name] = column.default_value if column.default_value
        hash
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

    def field_values_without_id
      field_values.tap do |field_values|
        field_values.delete(:id)
      end
    end
  end
end

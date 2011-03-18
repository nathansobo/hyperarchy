module Prequel
  class Record < Tuple
    class << self
      delegate :all, :update, :dataset, :[], :to_update_sql, :to_sql, :get_column, :first, :find,
               :where, :join, :join_through, :left_join, :project, :group_by, :order_by, :limit, :offset, :tables,
               :synthetic_columns, :to => :relation

      def table
        relation
      end

      def to_relation
        relation
      end

      def inherited(klass)
        table_name = klass.name.demodulize.underscore.pluralize.to_sym
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

      def column(name, type, options = {})
        table.def_column(name, type, options)
        def_field_accessor(name)
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

      def secure_create(attributes={})
        secure_new(attributes).tap(&:save)
      end

      def secure_new(attributes={})
        allocate.tap {|r| r.secure_initialize(attributes)}
      end

      def has_many(name, options = {})
        class_name = options[:class_name] || name.to_s.singularize.camelize
        klass = class_name.constantize
        foreign_key = table.infer_join_columns(klass.columns)[1]
        define_method name do
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
        foreign_key_name = class_name.to_s.underscore + "_id"
        klass = class_name.constantize
        define_method name do
          parent_id = send(foreign_key_name)
          klass.find(parent_id)
        end
      end
    end

    delegate :synthetic_columns, :to => 'self.class'

    def initialize(values={})
      super(default_field_values.merge(values))
    end

    def secure_initialize(values={})
      initialize(values.slice(*create_whitelist - create_blacklist))
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

    def secure_update(attributes)
      soft_update(attributes.slice(*update_whitelist - update_blacklist))
      save
    end

    def save
      if id
        DB[table.name].filter(:id => id).update(dirty_field_values)
      else
        before_create
        before_save
        self.id = (DB[table.name] << field_values_without_id)
        Prequel.session[table.name][id] = self
        after_create
        after_save
        self
      end
      mark_clean
    end

    def get_record(table_name)
      self if table_name == table.name
    end

    def field_values
      super.merge(synthetic_field_values)
    end

    def synthetic_field_values
      synthetic_columns.inject({}) do |hash, column|
        hash[column.name] = send(column.name)
        hash
      end
    end

    def wire_representation
      field_values.slice(*read_whitelist - read_blacklist).stringify_keys
    end

    protected

    def before_save; end
    def after_save; end

    def before_create; end
    def after_create; end

    def default_field_values
      columns.inject({}) do |hash, column|
        hash[column.name] = column.default_value if column.default_value
        hash
      end
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

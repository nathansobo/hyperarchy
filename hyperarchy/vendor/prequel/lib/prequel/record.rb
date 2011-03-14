module Prequel
  class Record < Tuple
    class << self
      delegate :all, :result_set, :[], :to_sql, :get_column, :first, :find, :where,
               :join, :left_join, :project, :group_by, :order_by, :limit, :offset, :tables,
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

      def new(field_values={})
        if field_values[:id]
          Prequel.session[table.name][field_values[:id]] ||= super
        else
          super
        end
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

    def initialize(values = {})
      super(default_field_values.merge(values))
    end

    def table
      relation
    end

    public :set_field_value

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
      readable_fields = read_whitelist - read_blacklist
      field_values.inject({}) do |wire_representation, (name, value)|
        wire_representation[name.to_s] = value if readable_fields.include?(name)
        wire_representation
      end
    end

    protected

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
  end
end

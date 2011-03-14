module Prequel
  class Record < Tuple
    class << self
      delegate :all, :result_set, :[], :to_sql, :get_column, :first, :find, :where,
               :join, :left_join, :project, :group_by, :order_by, :limit, :offset, :tables, 
               :to => :relation

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

      def column(name, type)
        relation.def_column(name, type)
        def_field_accessor(name)
      end

      def new(field_values={})
        Prequel.session[table.name][field_values[:id]] ||= super
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

    def table
      relation
    end

    public :set_field_value

    def get_record(table_name)
      self if table_name == table.name
    end
  end
end

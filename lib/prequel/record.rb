module Prequel
  class Record < Tuple
    class << self
      delegate :all, :result_set, :[], :to_sql, :get_column, :first, :find, :where, :join, :project, :to => :relation

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
module Model
  module Relations
    class Table < Relation
      attr_reader :global_name, :record_class, :columns_by_name
      attr_accessor :declared_fixtures

      def initialize(global_name, record_class)
        @global_name, @record_class = global_name, record_class
        @columns_by_name = ActiveSupport::OrderedHash.new
      end

      def define_column(name, type)
        columns_by_name[name] = Column.new(self, name, type)
      end

      def columns
        columns_by_name.values
      end

      def insert(record)
        Origin.insert(self, record.field_values_by_column_name)
      end

      def create(field_values = {})
        record = record_class.new(field_values)
        record.before_create if record.respond_to?(:before_create)
        insert(record)
        record.after_create if record.respond_to?(:after_create)
        record
      end

      def to_sql
        build_sql_query.to_sql
      end

      def build_sql_query(query=SqlQuery.new)
        query.add_from_table(self)
        query
      end

      def locate(path_fragment)
        find(path_fragment)
      end

      def initialize_identity_map
        Thread.current["#{global_name}_identity_map"] = {}
      end

      def identity_map
        Thread.current["#{global_name}_identity_map"]
      end

      def clear_identity_map
        Thread.current["#{global_name}_identity_map"] = nil
      end

      def load_fixtures(fixtures)
        fixtures.each do |id, field_values|
          insert(record_class.unsafe_new(field_values.merge(:id => id.to_s)))
        end
      end

      #TODO: test
      def clear_table
        Origin.clear_table(global_name)
      end

      #TODO: test
      def create_table
        columns_to_generate = columns
        Origin.create_table(global_name) do
          columns_to_generate.each do |c|
            column c.name, c.ruby_type
          end
        end
      end

      #TODO: test
      def drop_table
        Origin.drop_table(global_name)
      end
    end
  end
end

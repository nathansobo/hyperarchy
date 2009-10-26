module Model
  module Relations
    class Table < Relation
      attr_reader :global_name, :tuple_class, :columns_by_name, :global_identity_map

      def initialize(global_name, tuple_class)
        @global_name, @tuple_class = global_name, tuple_class
        @columns_by_name = ActiveSupport::OrderedHash.new
        @global_identity_map = {}
      end

      def define_column(name, type, options={})
        columns_by_name[name] = Column.new(self, name, type, options)
      end

      def columns
        columns_by_name.values
      end

      def column(column_or_name)
        case column_or_name
        when String, Symbol
          columns_by_name[column_or_name.to_sym]
        when Column
          column_or_name
        end
      end

      def create(field_values = {})
        record = tuple_class.new(field_values)
        record.before_create if record.respond_to?(:before_create)
        insert(record)
        record.mark_clean
        record.after_create if record.respond_to?(:after_create)
        record
      end

      def insert(record)
        Origin.insert(self, record.field_values_by_column_name)
      end

      def tables
        [self]
      end

      def build_sql_query(query=SqlQuery.new)
        query.add_from_table(self)
        query
      end

      def build_record_from_database(field_values)
        id = field_values[:id]

        if record_from_global_id_map = global_identity_map[id]
          record_from_global_id_map
        elsif record_from_id_map = thread_local_identity_map[id]
          record_from_id_map
        else
          record = tuple_class.unsafe_new(field_values)
          record.mark_clean
          thread_local_identity_map[id] = record
          record
        end
      end

      def initialize_identity_map
        Thread.current["#{global_name}_identity_map"] = {}
      end

      def thread_local_identity_map
        Thread.current["#{global_name}_identity_map"]
      end

      def clear_identity_map
        Thread.current["#{global_name}_identity_map"] = nil
      end

      def load_fixtures(fixtures)
        fixtures.each do |id, field_values|
          insert(tuple_class.unsafe_new(field_values.merge(:id => id.to_s)))
        end
      end

      def clear_table
        Origin.clear_table(global_name)
      end

      def create_table
        columns_to_generate = columns
        Origin.create_table(global_name) do
          columns_to_generate.each do |c|
            column c.name, c.ruby_type
          end
        end
      end

      def drop_table
        Origin.drop_table(global_name)
      end
    end
  end
end

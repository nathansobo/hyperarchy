module Monarch
  module Model
    class RemoteRepository
      delegate :transaction, :database_type, :execute_ddl, :to => :connection

      def connection
        Sequel::DATABASES.first
      end

      def insert(table, field_values)
#        LOGGER.debug("insert -- #{table.global_name}, #{field_values.inspect}")
        field_values.delete(:id) if field_values[:id].nil?
        connection.from(table.global_name).insert(field_values)
      end

      def update(table, id, field_values)
#        LOGGER.debug("update -- #{table.global_name}, #{id}, #{field_values.inspect}")
        connection.from(table.global_name).filter(:id => id).update(field_values)
      end

      def destroy(table, id)
#        LOGGER.debug("destroy -- #{table.global_name}, #{id}")
        connection.from(table.global_name).filter(:id => id).delete
      end

      def read(relation)
        records = connection.fetch(*relation.to_sql).map do |field_values|
          relation.build_record_from_database(field_values)
        end
        records
      end

      def execute_dui(sql, literals_hash={})
#        LOGGER.debug("execute_dui -- #{sql}, #{literals_hash.inspect}")
        connection.execute_dui(sql.lit(literals_hash).to_s(connection.dataset))
      end

      def execute_ddl(sql, literals_hash={})
        connection.execute_ddl(sql.lit(literals_hash).to_s(connection.dataset))
      end

      def reload(record, *columns)
        table = record.table
        relation = table.where(table.column(:id).eq(record.id))
        relation = relation.project(*columns) unless columns.empty?
        field_values = connection[*relation.to_sql].first
        raise "Record '#{record.id}' not found during reload" unless field_values
        record.update_fields_from_remote(field_values)
      end

      def create_table(name, &definition)
        connection.drop_table(name) if connection.table_exists?(name)
        connection.create_table(name, &definition)
      end

      def clear_table(name)
        connection[name].delete
      end

      def drop_table(name)
        connection.drop_table(name)
      end
    end
  end
end

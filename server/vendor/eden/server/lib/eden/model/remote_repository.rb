module Model
  class RemoteRepository
    attr_accessor :connection

    def insert(table, field_values)
      connection.from(table.global_name).insert(field_values)
    end

    def update(table, field_values)
      connection.from(table.global_name).filter(:id => field_values[:id]).update(field_values)
    end

    def read(table, query)
      connection[query].map do |field_values_by_column_name|
        id = field_values_by_column_name[:id]
        record_from_id_map = table.identity_map[id]

        if record_from_id_map
          record_from_id_map
        else
          record = table.record_class.unsafe_new(field_values_by_column_name)
          table.identity_map[id] = record
          record
        end
      end
    end

    #TODO: test
    def create_table(name, &definition)
      connection.create_table(name, &definition)
    end

    #TODO: test
    def clear_table(name)
      connection[name].delete
    end

    #TODO: test
    def drop_table(name)
      connection.drop_table(name)
    end
  end
end

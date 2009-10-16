module Model
  class RemoteRepository
    attr_accessor :connection

    def insert(table, field_values)
      connection.from(table.global_name).insert(field_values)
    end

    def update(table, field_values)
      connection.from(table.global_name).filter(:id => field_values[:id]).update(field_values)
    end

    def read(relation)
      if relation.composite?
        read_composite_relation(relation)
      else
        read_simple_relation(relation)
      end
    end

    def read_composite_relation(relation)
      connection[relation.to_sql].map do |field_values|
        relation.record_class.new(field_values)
      end
    end

    def read_simple_relation(relation)
      table = relation.table
      connection[relation.to_sql].map do |field_values|


        id = field_values[:id]
        if record_from_id_map = table.identity_map[id]
          record_from_id_map
        else
          record = relation.record_class.unsafe_new(field_values)
          record.mark_clean
          table.identity_map[id] = record
          record
        end
      end
    end

    def reload(record)
      table = record.table
      query = table.where(table.column(:id).eq(record.id)).to_sql
      field_values = connection[query].first
      record.update_fields(field_values)
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

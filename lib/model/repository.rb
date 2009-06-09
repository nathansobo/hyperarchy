module Model
  class Repository
    attr_accessor :connection

    def insert(set, field_values)
      connection.from(set.global_name).insert(field_values)
    end

    def update(set, field_values)
      connection.from(set.global_name).filter(:id => field_values[:id]).update(field_values)
    end

    def read(set, query)
      connection[query].map do |field_values_by_attribute_name|
        id = field_values_by_attribute_name[:id]
        tuple_from_id_map = set.identity_map[id]

        if tuple_from_id_map
          tuple_from_id_map
        else
          tuple = set.tuple_class.unsafe_new(field_values_by_attribute_name)
          set.identity_map[id] = tuple
          tuple
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
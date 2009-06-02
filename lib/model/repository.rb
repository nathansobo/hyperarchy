module Model
  class Repository
    attr_accessor :connection

    def insert(table_name, attributes)
      connection.from(table_name).insert(attributes)
    end

    def read(tuple_class, query)
      connection[query].map do |field_values|
        tuple_class.unsafe_new(field_values)
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
module Model
  module Relations
    class Set < Relation
      attr_reader :global_name, :tuple_class, :attributes_by_name
      attr_accessor :declared_fixtures
    
      def initialize(global_name, tuple_class)
        @global_name, @tuple_class = global_name, tuple_class
        @attributes_by_name = SequencedHash.new
      end

      def define_attribute(name, type)
        attributes_by_name[name] = Attribute.new(self, name, type)
      end

      def attributes
        attributes_by_name.values
      end

      def insert(tuple)
        Origin.insert(global_name, tuple.field_values_by_attribute_name)
      end

      def create(field_values)
        tuple = tuple_class.new(field_values)
        insert(tuple)
        tuple
      end

      def to_sql
        build_sql_query.to_sql
      end

      def build_sql_query(query=SqlQuery.new)
        query.add_from_set(self)
        query
      end

      def locate(path_fragment)
        find(path_fragment)
      end

      def load_fixtures
        return unless declared_fixtures
        declared_fixtures.each do |id, field_values|
          insert(tuple_class.unsafe_new(field_values.merge(:id => id.to_s)))
        end
      end

      #TODO: test
      def clear_table
        Origin.clear_table(global_name)
      end

      #TODO: test
      def create_table
        attributes_to_become_columns = attributes
        Origin.create_table(global_name) do
          attributes_to_become_columns.each do |attribute|
            column attribute.name, attribute.type
          end
        end
      end
    end
  end
end
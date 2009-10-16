module Model
  class Repository
    class << self
      def instance
        @instance ||= new
      end

      delegate :new_table, :tables_by_name, :load_fixtures, :clear_tables, :create_schema,
               :tables, :initialize_identity_maps, :clear_identity_maps,
               :to => :instance
    end

    attr_reader :tables_by_name
    def initialize
      @tables_by_name = {}
    end

    def new_table(name, record_class)
      tables_by_name[name] = Relations::Table.new(name, record_class)
    end

    def tables
      tables_by_name.values
    end

    def initialize_identity_maps
      tables.each {|table| table.initialize_identity_map}
    end

    def clear_identity_maps
      tables.each {|table| table.clear_identity_map}
    end

    #TODO: test
    def create_schema
      tables.each {|table| table.create_table}
    end

    #TODO: test
    def load_fixtures(fixtures)
      fixtures.each do |table_name, table_fixtures|
        tables_by_name[table_name].load_fixtures(table_fixtures)
      end
    end

    #TODO: test
    def clear_tables
      tables.each {|table| table.clear_table}
    end

    def tables
      tables_by_name.values
    end
  end
end

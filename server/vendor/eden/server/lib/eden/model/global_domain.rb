module Model
  class GlobalDomain
    class << self
      def instance
        @instance ||= new
      end

      delegate :new_set, :sets_by_name, :load_fixtures, :clear_tables, :create_schema,
               :sets, :initialize_identity_maps, :clear_identity_maps,
               :to => :instance
    end
    include RemoteQueryable

    attr_reader :sets_by_name
    def initialize
      @sets_by_name = {}
    end

    def new_set(name, tuple_class)
      sets_by_name[name] = Relations::Set.new(name, tuple_class)
    end

    def locate(path_fragment)
      sets_by_name[path_fragment.to_sym]
    end

    def sets
      sets_by_name.values
    end

    def initialize_identity_maps
      sets.each {|set| set.initialize_identity_map}
    end

    def clear_identity_maps
      sets.each {|set| set.clear_identity_map}
    end

    #TODO: test
    def create_schema
      sets.each {|set| set.create_table}
    end

    #TODO: test
    def load_fixtures
      sets.each {|set| set.load_fixtures}
    end

    #TODO: test
    def clear_tables
      sets.each {|set| set.clear_table}
    end

    def sets
      sets_by_name.values
    end

    def resolve_named_relation(name)
      sets_by_name[name.to_sym]
    end
  end
end

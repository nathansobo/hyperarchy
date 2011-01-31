module Monarch
  module Model
    class Repository
      class << self
        def instance
          @instance ||= new
        end

        def reset
          @instance = new
        end

        delegate :new_table, :tables_by_name, :load_fixtures, :clear_tables, :create_schema, :num_subscriptions,
                 :tables, :initialize_local_identity_map, :clear_local_identity_map, :with_local_identity_map,
                 :transaction, :current_user, :current_user=, :to => :instance
      end

      thread_local_accessor :current_user
      attr_reader :tables_by_name
      def initialize
        @tables_by_name = {}
      end

      def transaction
        cancelled = false
        pause_events
        Origin.transaction do
          begin
            yield
          rescue Exception => e
            cancel_events
            cancelled = true
            raise e
          end
        end

        unless cancelled
          resume_events
        end
      end

      def pause_events
        tables.each {|table| table.pause_events}
      end

      def resume_events
        tables.each {|table| table.resume_events}
      end

      def cancel_events
        tables.each {|table| table.cancel_events}
      end

      def num_subscriptions
        tables.map {|table| table.num_subscriptions}.sum
      end

      def new_table(name, tuple_class)
        tables_by_name[name] = Relations::Table.new(name, tuple_class)
      end

      def tables
        tables_by_name.values
      end

      def with_local_identity_map
        initialize_local_identity_map
        yield
      ensure
        clear_local_identity_map
      end

      def initialize_local_identity_map


        tables.each {|table| table.initialize_identity_map}
      end

      def clear_local_identity_map
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
end
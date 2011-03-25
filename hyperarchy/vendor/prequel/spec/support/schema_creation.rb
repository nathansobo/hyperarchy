require 'prequel/relations/table'
require 'prequel/expressions/column'
require 'prequel/record'

module Prequel
  module Relations
    class Table < Relation
      def self.created_tables
        @created_tables ||= []
      end

      def self.drop_all_tables
        created_tables.each(&:drop_table)
      end

      delegate :created_tables, :to => 'self.class'
      def create_table
        DB.drop_table(name) if DB.table_exists?(name)
        columns.tap do |columns| # bind to a local to bring inside of instance_eval
          DB.create_table(name) do
            columns.each do |c|
              if c.name == :id
                primary_key c.name, c.schema_type
              else
                column c.name, c.schema_type
              end
            end
          end
        end

        created_tables.push(self)
      end

      def drop_table
        if DB.table_exists?(name)
          DB.drop_table(name)
          created_tables.delete(self)
        end
      end
    end
  end

  module Expressions
    class Column
      def schema_type
        case type
          when :string
            String
          when :integer
            Integer
          when :datetime
            Time
          when :boolean
            TrueClass
          else
            raise "Can't convert #{type.inspect} to a type suitable for Sequel migrations"
        end
      end
    end
  end

  class Record
    singleton_class.delegate :create_table, :to => :table
  end
end
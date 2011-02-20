module Monarch
  module Model
    module Sql
      class ColumnRef
        attr_accessor :table_ref, :name

        def initialize(table_ref, name)
          @table_ref, @name = table_ref, name
        end

        def to_sql
          "#{table_ref.name}.#{name}"
        end

        def literals_hash
          {}
        end

        def derive(table_ref, &block)
          DerivedColumn.new(table_ref, self, block.call(self))
        end
      end
    end
  end
end
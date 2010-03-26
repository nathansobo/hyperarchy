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
    end
  end
end

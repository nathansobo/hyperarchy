module Model
  module Sql
    class Update
      attr_reader :column_values, :table, :conditions

      def initialize(column_values)
        @column_values = column_values
        @conditions = []
      end

      def to_sql
        "update #{table.global_name} set #{column_values_sql}#{where_clause_sql}"
      end

      def add_from_table(table)
        raise "Cannot add multiple tables yet (updates involving joins not supported)" if @table
        @table = table
      end

      def add_condition(predicate)
        conditions.push(predicate) unless conditions.include?(predicate)
      end

      protected

      def column_values_sql
        column_values.keys.sort.map do |column|
          "#{column.name} = #{column_values[column].to_sql}"
        end.join(", ")
      end

      def where_clause_sql
        if conditions.empty?
          ""
        else
          " where #{conditions.map {|c| c.to_sql}.join(" and ")}"
        end
      end
    end
  end
end

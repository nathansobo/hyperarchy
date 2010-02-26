module Model
  module Sql
    class Select
      attr_reader :from_tables, :conditions
      attr_writer :select_clause_columns

      def initialize(from_tables=[], conditions=[])
        @from_tables, @conditions = from_tables, conditions
      end

      def to_sql
        "#{select} #{select_clause_sql} from #{from_tables_sql}#{where_clause_sql}"
      end

      def add_from_table(table)
        from_tables.push(table) unless from_tables.include?(table)
      end

      def add_condition(predicate)
        conditions.push(predicate) unless conditions.include?(predicate)
      end

      def has_explicit_select_clause_columns?
        !@select_clause_columns.nil?
      end

      def clone
        clone = Select.new(from_tables.clone, conditions.clone)
        clone.select_clause_columns = @select_clause_columns
        clone
      end

      protected
      def select
        if from_tables.size > 1
          "select distinct"
        else
          "select"
        end
      end

      def where_clause_sql
        if conditions.empty?
          ""
        else
          " where #{conditions.map {|c| c.to_sql}.join(" and ")}"
        end
      end

      def select_clause_sql
        return '*' unless select_clause_columns
        select_clause_columns.map {|c| c.select_clause_sql }.join(", ")
      end

      def from_tables_sql
        from_tables.map {|s| s.global_name}.join(", ")
      end

      def select_clause_columns
        return @select_clause_columns if @select_clause_columns
        if from_tables.size == 1
          @select_clause_columns = nil
        else
          @select_clause_columns = columns_aliased_with_table_name_prefix
        end
      end

      def columns_aliased_with_table_name_prefix
        from_tables.map do |table|
          table.concrete_columns.map do |column|
            AliasedColumn.new(column, "#{table.global_name}__#{column.name}")
          end
        end.flatten
      end
    end
  end
end

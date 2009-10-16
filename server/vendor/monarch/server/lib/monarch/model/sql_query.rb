module Model
  class SqlQuery
    attr_reader :from_tables, :conditions
    attr_writer :projected_columns
    
    def initialize
      @from_tables = []
      @conditions = []
    end

    def to_sql
      "#{select} #{projected_columns_sql} from #{from_tables_sql}#{where_clause_sql}"
    end

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

    def projected_columns_sql
      return '*' unless projected_columns
      projected_columns.map {|c| c.to_sql }.join(", ")
    end

    def from_tables_sql
      from_tables.map {|s| s.global_name}.join(", ")
    end

    def add_from_table(table)
      from_tables.push(table) unless from_tables.include?(table)
    end

    def add_condition(predicate)
      conditions.push(predicate) unless conditions.include?(predicate)
    end

    def projected_columns
      return @projected_columns if @projected_columns
      if from_tables.size == 1
        @projected_columns = nil
      else
        @projected_columns = columns_aliased_with_table_name_prefix
      end
    end

    def columns_aliased_with_table_name_prefix
      from_tables.map do |table|
        table.columns.map do |column|
          ProjectedColumn.new(column, "#{table.global_name}__#{column.name}")
        end
      end.flatten
    end
  end
end

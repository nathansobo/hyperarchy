module Monarch
  module Model
    module Sql
      class PostgresUpdateStatement < UpdateStatement
        def to_sql
          ["update",
            update_table_sql,
           "set",
           set_clause_assignments_sql,
           from_tables_sql,
           where_clause_sql
          ].join(" ")
        end

        def update_table_sql
          from_clause_table_refs.first.to_sql
        end

        def from_tables_sql
          return nil unless from_clause_table_refs.length > 1
          "from " + from_clause_table_refs.drop(1).map do |table_ref|
            table_ref.to_sql
          end.join(", ")
        end

        protected
        def set_clause_assigment_sql(column_ref, expression)
          "#{column_ref.name} = #{expression.to_sql}"
        end
      end
    end
  end
end
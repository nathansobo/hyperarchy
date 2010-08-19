module Monarch
  module Model
    module Sql
      class MysqlUpdateStatement < UpdateStatement
        def to_sql
          ["update",
            from_tables_sql,
           "set",
           set_clause_assignments_sql,
           where_clause_sql
          ].join(" ")
        end

        protected
        def set_clause_assignment_sql(column_ref, expression)
          "#{column_ref.to_sql} = #{expression.to_sql}"
        end
      end
    end
  end
end
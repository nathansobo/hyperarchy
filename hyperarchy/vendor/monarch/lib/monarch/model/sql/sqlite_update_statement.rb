module Monarch
  module Model
    module Sql
      class SqliteUpdateStatement < MysqlUpdateStatement
        protected
        def set_clause_assignment_sql(column_ref, expression)
          "#{column_ref.name} = #{expression.to_sql}"
        end
      end
    end
  end
end
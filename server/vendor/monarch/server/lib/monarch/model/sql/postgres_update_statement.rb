module Monarch
  module Model
    module Sql
      class PostgresUpdateStatement < UpdateStatement

        def initialize(set_clause_assignments, from_clause_table_ref, where_clause_predicates)
          super
          raise "You can not update outer joins in postgres" unless from_clause_table_refs.first.instance_of?(Table)
        end

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
        def set_clause_assignment_sql(column_ref, expression)
          "#{column_ref.name} = #{expression.to_sql}"
        end
      end
    end
  end
end
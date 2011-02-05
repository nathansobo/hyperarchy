module Monarch
  module Model
    module Relations
      class View < Relation
        attr_reader :name, :relation

        def initialize(name, relation)
          @name, @relation = name, relation
        end

        def create_view(mode="")
          sql, literals = relation.to_sql
          Origin.execute_ddl("create #{mode} view #{name} as (#{sql})", literals)
        end

        def drop_view
          Origin.execute_ddl("drop view #{name}")
        end
      end
    end
  end
end
module Monarch
  module Model
    module Relations
      class View < Relation
        attr_reader :name, :relation, :concrete_columns_by_underlying_column
        alias :global_name :name

        delegate :build_record_from_database, :build, :viable_foreign_key_name, :to => :relation

        def initialize(name, relation)
          @name, @relation = name, relation
          @concrete_columns_by_underlying_column = {}
          relation.concrete_columns.each do |underlying_column|
            concrete_columns_by_underlying_column[underlying_column] = Expressions::ConcreteColumn.new(self, underlying_column.name, underlying_column.type)
          end
        end

        def column(column_or_name)
          underlying_column = relation.column(column_or_name)
          if underlying_column
            concrete_columns_by_underlying_column[underlying_column]
          else
            nil
          end
        end

        def concrete_columns
          concrete_columns_by_underlying_column.values
        end

        def exposed_name=(name)
          relation.exposed_name=(name)
        end

        def surface_tables
          [self]
        end

        def internal_sql_select_list(state)
          state[self][:internal_sql_select_list] ||= [Sql::Asterisk.new(internal_sql_table_ref(state))]
        end

        def internal_sql_table_ref(state)
          state[self][:internal_sql_table_ref] ||= Sql::Table.new(self)
        end

        def internal_sql_where_predicates(state)
          []
        end

        def internal_sql_sort_specifications(state)
          []
        end

        def internal_sql_grouping_column_refs(state)
          []
        end
#
#        def internal_sql_offset(state)
#          nil
#        end
#
#        def has_operands?
#          false
#        end

        def create_view(mode="")
          Origin.execute_ddl(*to_sql(mode))
        end

        def drop_view
          Origin.execute_ddl("drop view if exists #{name} cascade")
        end

        def to_sql(mode='')
          mode = "#{mode} " unless mode.blank?
          sql, literals = relation.to_sql
          ["create #{mode}view #{name} as (#{sql})", literals]
        end

        def ==(other)
          return false unless self.class == other.class
          name == other.name && relation == other.relation
        end
      end
    end
  end
end
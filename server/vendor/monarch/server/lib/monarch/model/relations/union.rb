module Monarch
  module Model
    module Relations
      class Union < Relation
        delegate :build_record_from_database, :build, :create, :create!, :column, :concrete_columns, :viable_foreign_key_name, :to => "operands.first"
        attr_reader :operands

        def initialize(operands, &block)
          super(&block)
          @operands = operands
        end

        def surface_tables
          operands.inject([]) do |acc, operand|
            acc | operand.surface_tables
          end
        end

        def internal_sql_select_list(state)
          state[self][:internal_sql_select_list] ||= [Sql::Asterisk.new(derived_tables(state).first)]
        end

        def internal_sql_table_ref(state)
          state[self][:internal_sql_table_ref] ||= Sql::UnionedTable.new(derived_tables(state))
        end

        def derived_tables(state)
          state[self][:derived_tables] ||=
            operands.map do |operand|
              Sql::DerivedTable.new(operand.sql_query_specification(state), state.next_derived_table_name, operand)
            end
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

        protected

        def subscribe_to_operands
          operands.each do |operand|
            operand_subscriptions.add(operand.on_insert do |tuple|
              on_insert_node.publish(tuple)
            end)

            operand_subscriptions.add(operand.on_update do |tuple, changeset|
              on_update_node.publish(tuple, changeset)
            end)

            operand_subscriptions.add(operand.on_remove do |tuple|
              on_remove_node.publish(tuple)
            end)
          end
        end
      end
    end
  end
end
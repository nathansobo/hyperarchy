module Monarch
  module Model
    module Relations
      class TableProjection < UnaryOperator
        class << self
          def from_wire_representation(representation, repository)
            operand = Relation.from_wire_representation(representation["operand"], repository)
            projected_table = repository.get_view(representation["projected_table"]).surface_tables.first
            new(operand, projected_table)
          end
        end

        attr_reader :operand, :projected_table
        delegate :column, :build, :create, :create!, :exposed_name, :to => :projected_table
        def initialize(operand, projected_table, &block)
          super(&block)
          @operand, @projected_table = operand, projected_table
        end

        def surface_tables
          [projected_table]
        end

        def build_record_from_database(field_values)
          projected_table.build_record_from_database(field_values)
        end

        def ==(other)
          return false unless other.instance_of?(self.class)
          operand == other.operand && projected_table == other.projected_table
        end

        protected
        attr_reader :last_changeset

        def internal_sql_select_list(state)
          state[self][:internal_sql_select_list] ||=
            [Sql::Asterisk.new(projected_table.external_sql_table_ref(state))]
        end

        def subscribe_to_operands
          operand_subscriptions.add(operand.on_insert do |composite_tuple|
            record = composite_tuple[projected_table]
            on_insert_node.publish(record) if num_instances_in_operand(record) == 1
          end)

          operand_subscriptions.add(operand.on_update do |composite_tuple, changeset|
            projected_changeset = project_changeset(changeset)
            if projected_changeset.has_changes? && last_changeset != projected_changeset
              @last_changeset = projected_changeset
              on_update_node.publish(composite_tuple[projected_table], projected_changeset)
            end
          end)

          operand_subscriptions.add(operand.on_remove do |composite_tuple|
            record = composite_tuple[projected_table]
            on_remove_node.publish(record) if num_instances_in_operand(record) == 0
          end)
        end

        def num_instances_in_operand(record)
          operand.where(id_column.eq(record.id)).project(id_column.count).value
        end

        def id_column
          @id_column ||= projected_table.column(:id)
        end

        def project_changeset(changeset)
          Changeset.new(changeset.tuple[projected_table], changeset.new_state[projected_table], changeset.old_state[projected_table])
        end
      end
    end
  end
end
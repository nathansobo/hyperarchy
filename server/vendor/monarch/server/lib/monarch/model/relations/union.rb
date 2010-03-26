module Model
  module Relations
    class Union < Relation
      delegate :build_record_from_database, :column, :to => "operands.first"
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

      def build_sql_query(query=Sql::Select.new)
        Sql::Union.new(operands.map {|o| o.build_sql_query(query.clone)})
      end

      def sql_from_table_ref
#        Sql::JoinedTable.new(:union, operands[0].subquery.sql_from_table_ref, operands[1].subquery.sql_from_table_ref, nil)
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

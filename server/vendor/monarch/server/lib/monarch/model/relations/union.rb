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
    end
  end
end

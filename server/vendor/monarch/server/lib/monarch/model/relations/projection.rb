module Model
  module Relations
    class Projection < Relations::Relation
      attr_reader :operand, :projected_columns_by_name

      def initialize(operand, projected_columns, &block)
        @operand, @projected_columns = operand, projected_columns

        @projected_columns_by_name = ActiveSupport::OrderedHash.new
        projected_columns.each do |projected_column|
          projected_columns_by_name[projected_column.name] = projected_column
        end
        
        class_eval(&block) if block
      end

      def projected_columns
        projected_columns_by_name.values
      end

      def column(name)
        projected_columns_by_name[name]
      end

      def build_sql_query(sql_query=SqlQuery.new)
        sql_query.projected_columns = projected_columns
        operand.build_sql_query(sql_query)
      end

      def composite?
        true
      end

      def constituent_tables
        operand.constituent_tables
      end

      def record_class
        return @record_class if @record_class
        @record_class = Class.new(ProjectionRecord)
        @record_class.projected_columns = projected_columns
        @record_class
      end
    end
  end
end

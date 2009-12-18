module Model
  module Sql
    class Union
      attr_reader :subqueries
      
      def initialize(subqueries)
        @subqueries = subqueries
      end

      def to_sql
        subqueries.map {|sq| sq.to_sql}.join( " union ")
      end
    end
  end
end

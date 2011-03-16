module Prequel
  module Sql
    class JoinedTableRef
      attr_reader :left, :right, :predicate
      def initialize(left, right, predicate)
        @left, @right, @predicate = left, right, predicate
      end

      def to_sql
        [left.to_sql,
         join_type,
         right.to_sql,
         'on',
         predicate.to_sql
        ].join(' ')
      end

      def build_tuple(field_values)
        CompositeTuple.new_from_database(left.build_tuple(field_values), right.build_tuple(field_values))
      end
    end
  end
end
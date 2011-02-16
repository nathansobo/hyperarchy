module Monarch
  module Model
    module Sql
      class UnionedTable
        attr_accessor :table_refs
        def initialize(table_refs)
          @table_refs = table_refs
        end

        def to_sql
          table_refs[1..-1].each do |ref|
            ref.suppress_alias = true
          end
          table_refs.map(&:to_sql).join(" union ")
        end

        def literals_hash
          table_refs.map(&:literals_hash).inject(:merge)
        end

        def inner_join_conditions
          []
        end

        def inner_joined_table_refs
          [self]
        end
      end
    end
  end
end
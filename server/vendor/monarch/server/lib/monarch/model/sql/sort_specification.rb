module Monarch
  module Model
    module Sql
      class SortSpecification
        attr_reader :column_ref, :direction
        def initialize(column_ref, direction)
          @column_ref, @direction = column_ref, direction
        end

        def to_sql
          "#{column_ref.to_sql} #{direction}"
        end
      end
    end
  end
end
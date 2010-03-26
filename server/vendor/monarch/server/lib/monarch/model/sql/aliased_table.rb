module Model
  module Sql
    # used when a Table needs to be associated with a correlation name
    class AliasedTable
      attr_accessor :table, :name
    end
  end
end


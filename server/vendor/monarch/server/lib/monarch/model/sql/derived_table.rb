module Model
  module Sql
    class DerivedTable
      attr_accessor :subquery # points to a QuerySpecification
      attr_accessor :name     # apparently optional, though i'm not sure if i would generate a derived table without a name
    end
  end
end
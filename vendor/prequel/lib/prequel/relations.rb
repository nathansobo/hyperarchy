module Prequel
  module Relations
    extend ActiveSupport::Autoload

    autoload :Distinct
    autoload :GroupBy
    autoload :InnerJoin
    autoload :Join
    autoload :LeftJoin
    autoload :Limit
    autoload :Offset
    autoload :OrderBy
    autoload :Projection
    autoload :Relation
    autoload :Selection
    autoload :Table
    autoload :UnaryRelationMethods
    autoload :Union
  end
end

module Prequel
  module Relations
    extend ActiveSupport::Autoload

    autoload :GroupBy
    autoload :Join
    autoload :InnerJoin
    autoload :LeftJoin
    autoload :Limit
    autoload :Offset
    autoload :OrderBy
    autoload :Projection
    autoload :Relation
    autoload :Selection
    autoload :Table
  end
end

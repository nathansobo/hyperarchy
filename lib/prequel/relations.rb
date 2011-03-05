module Prequel
  module Relations
    extend ActiveSupport::Autoload

    autoload :GroupBy
    autoload :InnerJoin
    autoload :Projection
    autoload :Relation
    autoload :Selection
    autoload :Table
  end
end

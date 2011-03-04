module Prequel
  module Sql
    extend ActiveSupport::Autoload

    autoload :DerivedQueryColumn
    autoload :InnerJoinedTableRef
    autoload :NamedTableRef
    autoload :Query
    autoload :QueryColumn
    autoload :Subquery
    autoload :TableRef
  end
end

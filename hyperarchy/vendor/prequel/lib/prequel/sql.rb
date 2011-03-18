module Prequel
  module Sql
    extend ActiveSupport::Autoload

    autoload :DerivedQueryColumn
    autoload :JoinedTableRef
    autoload :InnerJoinedTableRef
    autoload :LeftJoinedTableRef
    autoload :NamedTableRef
    autoload :Query
    autoload :QueryColumn
    autoload :Subquery
    autoload :TableRef
    autoload :UpdateStatement
  end
end

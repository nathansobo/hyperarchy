module Prequel
  module Expressions
    extend ActiveSupport::Autoload

    autoload :AliasedExpression
    autoload :Column
    autoload :DerivedColumn
    autoload :Equal
    autoload :Expression
    autoload :NumericExpression
    autoload :OrderExpression
    autoload :SetFunction
  end
end

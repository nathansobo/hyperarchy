module Prequel
  module Expressions
    extend ActiveSupport::Autoload

    autoload :AliasedExpression
    autoload :Column
    autoload :DerivedColumn
    autoload :Equal
    autoload :Expression
    autoload :NotEqual
    autoload :NumericExpression
    autoload :OrderExpression
    autoload :Predicate
    autoload :SetFunction
  end
end

module Prequel
  module Expressions
    extend ActiveSupport::Autoload

    autoload :AliasedExpression
    autoload :And
    autoload :Column
    autoload :DerivedColumn
    autoload :Equal
    autoload :Expression
    autoload :GreaterThan
    autoload :GreaterThanOrEqual
    autoload :LessThan
    autoload :LessThanOrEqual
    autoload :NotEqual
    autoload :NumericExpression
    autoload :OrderExpression
    autoload :Predicate
    autoload :SetFunction
  end
end

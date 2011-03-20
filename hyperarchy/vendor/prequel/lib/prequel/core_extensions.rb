module Prequel
  module HashExtensions
    def to_predicate
      raise NotImplementedError unless size == 1
      keys.first.eq(values.first)
    end

    Hash.send(:include, self)
  end

  module SymbolExtensions
    def as(alias_name)
      "#{self}___#{alias_name}".to_sym
    end

    def eq(other)
      Expressions::Equal.new(self, other)
    end

    def neq(other)
      Expressions::NotEqual.new(self, other)
    end

    def gt(other)
      Expressions::GreaterThan.new(self, other)
    end

    def gte(other)
      Expressions::GreaterThanOrEqual.new(self, other)
    end

    def lt(other)
      Expressions::LessThan.new(self, other)
    end

    def lte(other)
      Expressions::LessThanOrEqual.new(self, other)
    end

    def count
      Expressions::SetFunction.new(self, :count)
    end

    def asc
      Expressions::OrderExpression.new(self, :asc)
    end

    def desc
      Expressions::OrderExpression.new(self, :desc)
    end

    def +(right)
      Expressions::NumericExpression.new(:+, self, right)
    end

    def -(right)
      Expressions::NumericExpression.new(:-, self, right)
    end

    def resolve_in_relations(relations)
      if self =~ /^(.+)___(.+)$/
        column_name = $1.to_sym
        alias_name = $2.to_sym
        Expressions::AliasedExpression.new(column_name, alias_name).resolve_in_relations(relations)
      else
        relations.each do |relation|
          if column = relation.get_column(self)
            return column
          end
        end
        nil
      end
    end

    def to_sql
      inspect
    end

    def to_set_clause_sql
      inspect
    end

    Symbol.send(:include, self)
  end

  module PrimitiveExtensions
    def resolve_in_relations(relations)
      self
    end

    def resolve_in_query(query)
      query.add_literal(self)
    end

    def wire_representation
      {
        'type' => 'scalar',
        'value' => self
      }
    end

    Numeric.send(:include, self)
    String.send(:include, self)
    TrueClass.send(:include, self)
    FalseClass.send(:include, self)
    NilClass.send(:include, self)
    Time.send(:include, self)
  end

  module NilClassExtensions
    def resolve_in_query(query)
      self
    end

    def to_sql
      "null"
    end

    NilClass.send(:include, self)
  end
end

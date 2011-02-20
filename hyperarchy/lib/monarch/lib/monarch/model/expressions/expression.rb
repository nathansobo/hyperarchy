module Monarch
  module Model
    module Expressions
      class Expression
        class << self
          def from_wire_representation(representation, repository)
            case representation["type"]
              when "eq"
                Eq.from_wire_representation(representation, repository)
              when "and"
                And.from_wire_representation(representation, repository)
              else
                raise "No way to translate #{representation.inspect} into an Expression"
            end
          end
        end

        def eq(right_operand)
          Expressions::Eq.new(self, right_operand)
        end

        def neq(right_operand)
          Expressions::Neq.new(self, right_operand)
        end

        def +(right_operand)
          Expressions::Plus.new(self, right_operand)
        end

        def -(right_operand)
          Expressions::Minus.new(self, right_operand)
        end

        def <(right_operand)
          Expressions::LessThan.new(self, right_operand)
        end

        def >(right_operand)
          Expressions::GreaterThan.new(self, right_operand)
        end

        def as(column_alias)
          AliasedExpression.new(self, column_alias.to_sym)
        end

        def asc
          SortSpecification.new(self, :asc)
        end

        def desc
          SortSpecification.new(self, :desc)
        end

        def max
          AggregationFunction.new('max', self)
        end

        def min
          AggregationFunction.new('min', self)
        end

        def sum
          AggregationFunction.new('sum', self)
        end

        def count
          AggregationFunction.new('count', self)
        end

        def derive(relation)
          DerivedColumn.new(relation, self, name)
        end
      end
    end
  end
end
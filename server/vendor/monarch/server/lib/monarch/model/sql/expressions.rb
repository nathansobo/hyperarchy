module Model
  module Sql
    # instantiated with ColumnRefs or Expressions
    module Expressions

      class Binary
        attr_reader :left_expression, :right_expression

        def initialize(left_expression, right_expression)
          @left_expression, @right_expression = left_expression, right_expression
        end

        def to_sql
          @to_sql ||= "#{left_expression.to_sql} #{operator_sql} #{right_expression.to_sql}"
        end

        def flatten
          [self]
        end

        def hash
          @hash ||= [left_expression.to_sql, right_expression.to_sql].sort.join(operator_sql).hash
        end

        def eql?(other)
          other.hash == hash
        end

        def has_nil_operand?
          left_expression.nil? || right_expression.nil?
        end
      end

      class Eq < Binary
        def operator_sql
          has_nil_operand?? "is" : "="
        end
      end

      class Neq < Binary
        def operator_sql
          has_nil_operand?? "is not" : "!="
        end
      end

      class Plus < Binary
        def operator_sql
          "+"
        end
      end

      class And
        attr_reader :predicates

        def initialize(predicates)
          @predicates = predicates
        end

        def to_sql
          predicates.map do |predicate|
            predicate.to_sql
          end.sort.join(" and ")
        end

        def flatten
          predicates.map {|p| p.flatten}.flatten
        end
      end

      class SetFunction
        attr_reader :type, :expression
        def initialize(type, expression)
          @type, @expression = type, expression
        end

        def to_sql
          "#{type}(#{expression.to_sql})"
        end
      end
    end
  end
end

module Model
  module Sql
    class QuerySpecification
      # :set_quantifier can be 'distinct' or 'all'
      # :select_list is populated with DerivedColumn or Asterisk instances
      # :from_clause is populated by a "table reference", which can be a Table, AliasedTable, DerivedTable, or JoinedTable
      # :where clause
      # :grouping_column_refs is populated by GroupingColumnRef objects
      attr_accessor :set_quantifier, :select_list, :from_clause, :where_clause_predicates, :grouping_column_refs

      def initialize(set_quantifier, select_list, from_clause, where_clause_predicates=[], grouping_column_refs=[])
        @set_quantifier = set_quantifier
        @select_list = select_list
        @from_clause = from_clause
        @where_clause_predicates = where_clause_predicates
        @grouping_column_refs = grouping_column_refs
      end

      def to_sql
        ["select",
         set_quantifier_sql,
         select_list_sql,
         "from",
         from_clause_sql,
         where_clause_sql
        ].compact.join(" ")
      end

      protected

      def set_quantifier_sql
        nil
      end

      def select_list_sql
        select_list.map do |select_column|
          select_column.to_sql
        end.join(", ")
      end

      def from_clause_sql
        from_clause.to_sql
      end

      def where_clause_sql
        return nil if where_clause_predicates.empty?
        "where " + where_clause_predicates.map do |predicate|
          predicate.to_sql
        end.sort.join(" and ")
      end
    end

    # Represents the columns exposed at the surface of a table ref
    # QuerySpecification#select_list is populated with DerivedColumn and Asterisk objects
    class DerivedColumn
      # :expression can be a column reference or a more complex value expression involving literals, operators, and functions
      attr_accessor :table_ref, :expression, :name

      def initialize(table_ref, expression, name=nil)
        @table_ref, @expression, @name = table_ref, expression, name
        @name = expression.name if name.nil? && expression.respond_to?(:name)
      end

      def ref
        @ref ||= ColumnRef.new(table_ref, name)
      end

      def derive(table_ref, &block)
        DerivedColumn.new(table_ref, ref, block.call(ref))
      end

      def aliased?
        @aliased ||= name && (!expression.respond_to?(:name) || expression.name != name)
      end

      def to_sql
        expression.to_sql + as_sql
      end

      protected
      
      def as_sql
        aliased?? " as #{name}" : ""
      end
    end

    # Represents the set of all columns in a given table ref at the surface of a table ref that contains it
    # QuerySpecification#select_list is populated with DerivedColumn and Asterisk objects
    class Asterisk
      attr_accessor :table_ref # optional, can be a table or correlation name

      def initialize(table_ref=nil)
        @table_ref = table_ref
      end
      
      def to_sql
        "#{table_ref.name}.*"
      end

      def derive(deriving_table_ref, &block)
        table_ref.derived_columns.map do |derived_column|
          derived_column.derive(deriving_table_ref, &block)
        end
      end
    end

    class Table
      attr_reader :algebra_table

      def initialize(algebra_table)
        @algebra_table = algebra_table
      end

      def to_sql
        name
      end

      def name
        algebra_table.global_name
      end

      def derived_columns
        algebra_table.concrete_columns.map do |column|
          column.sql_derived_column
        end
      end
    end

    # used when a Table needs to be associated with a correlation name
    class AliasedTable
      attr_accessor :table, :name
    end

    class DerivedTable
      attr_accessor :subquery # points to a QuerySpecification
      attr_accessor :name     # apparently optional, though i'm not sure if i would generate a derived table without a name
    end

    class JoinedTable
      # :type can be INNER, LEFT OUTER, RIGHT OUTER, or UNION
      # the table refs can be aliased, derived, or joined tables
      # the condition is a Predicate involving column refs or expressions
      attr_accessor :type, :left_table_ref, :right_table_ref, :conditions

      def initialize(type, left_table_ref, right_table_ref, conditions)
        @type = type
        @left_table_ref = left_table_ref
        @right_table_ref = right_table_ref
        @conditions = conditions
      end

      def to_sql
        [left_table_ref.to_sql,
         type,
         "join",
         right_table_ref.to_sql,
         "on",
         join_conditions_sql
        ].join(" ")
      end

      protected

      def join_conditions_sql
        conditions.map do |predicate|
          predicate.to_sql
        end.join(" ")
      end
    end

    class ColumnRef
      attr_accessor :table_ref, :name

      def initialize(table_ref, name)
        @table_ref, @name = table_ref, name
      end

      def to_sql
        "#{table_ref.name}.#{name}"
      end
    end

    class GroupingColumnRef
      attr_accessor :column_ref, :collate_clause
    end

    module Predicates
      # instantiated with ColumnRefs or Expressions
      class Eq
        attr_accessor :left_expression, :right_expression

        def initialize(left_expression, right_expression)
          @left_expression, @right_expression = left_expression, right_expression
        end

        def to_sql
          "#{left_expression.to_sql} = #{right_expression.to_sql}"
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
      end
    end

    module Expressions
      class Plus

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
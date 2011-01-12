module Monarch
  module Model
    module Sql
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

        def derive(state, table_ref, &block)
          DerivedColumn.new(table_ref, ref, block.call(ref))
        end

        def aliased?
          @aliased ||= name && (!expression.respond_to?(:name) || expression.name != name)
        end

        def to_sql
          expression.to_sql + as_sql
        end

        def literals_hash
          expression.literals_hash
        end

        protected


        def as_sql
          name ? " as #{name}" : ""
        end
      end
    end
  end
end
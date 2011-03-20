module Prequel
  module Sql
    class Query
      attr_accessor :select_list, :group_bys, :order_bys, :limit, :offset, :projected_table_ref
      attr_reader :relation, :table_ref, :conditions, :literals, :singular_table_refs, :subquery_count, :query_columns
      attr_writer :tuple_builder
      delegate :count, :empty?, :to => :dataset

      def initialize(relation)
        @relation = relation
        @conditions = []
        @literals = {}
        @singular_table_refs = { relation => self }
        @subquery_count = 0
        @query_columns = {}
      end

      def all
        dataset.map do |field_values|
          tuple_builder.build_tuple(field_values)
        end
      end

      def each
        dataset.each do |field_values|
          yield tuple_builder.build_tuple(field_values)
        end
      end

      def first
        r = dataset
        r.empty? ? nil : tuple_builder.build_tuple(r.first)
      end

      def dataset
        DB[*to_sql]
      end

      def to_sql
        [sql_string, literals]
      end

      def build
        relation.visit(self)
        self
      end

      # only subqueries have names
      def name
        nil
      end

      def table_ref=(table_ref)
        raise "A table ref has already been assigned" if @table_ref
        @table_ref = table_ref
      end

      def add_condition(predicate)
        conditions.push(predicate)
      end

      def add_literal(literal)
        "v#{literals.size + 1}".to_sym.tap do |placeholder|
          literals[placeholder] = literal
        end
      end

      def add_singular_table_ref(relation, table_ref)
        singular_table_refs[relation] = table_ref
      end

      def add_subquery(relation)
        @subquery_count += 1
        subquery = Subquery.new(self, relation, "t#{subquery_count}".to_sym)
        add_singular_table_ref(relation, subquery)
        subquery.build
      end

      def resolve_derived_column(column, qualified=false)
        query_columns[column] ||= begin
          resolved_expression = column.expression.resolve_in_query(self)
          resolved_name = qualified ? resolved_expression.qualified_name : column.name
          Sql::DerivedQueryColumn.new(self, resolved_name, resolved_expression)
        end
      end

      def tuple_builder
        @tuple_builder || table_ref
      end

      protected

      def sql_string
        [select_clause_sql,
         from_clause_sql,
         where_clause_sql,
         order_by_clause_sql,
         group_by_clause_sql,
         limit_clause_sql,
         offset_clause_sql
        ].compact.join(" ")
      end

      def select_clause_sql
        "select " +
          if select_list
            select_list.map { |column| column.to_select_clause_sql }.join(', ')
          else
            '*'
          end
      end

      def from_clause_sql
        "from #{table_ref.to_sql}"
      end

      def where_clause_sql
        return nil if conditions.empty?
        'where ' + conditions.map(&:to_sql).join(' and ')
      end

      def group_by_clause_sql
        return nil unless group_bys
        'group by ' + group_bys.map(&:to_sql).join(', ')
      end

      def order_by_clause_sql
        return nil unless order_bys
        'order by ' + order_bys.map(&:to_sql).join(', ')
      end

      def limit_clause_sql
        return nil unless limit
        "limit #{limit}"
      end

      def offset_clause_sql
        return nil unless offset
        "offset #{offset}"
      end
    end
  end
end
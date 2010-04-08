module Model
  module Relations
    class Relation
      class << self
        def from_wire_representation(representation, repository)
          case representation["type"]
          when "table"
            repository.resolve_table_name(representation["name"])
          when "selection"
            Selection.from_wire_representation(representation, repository)
          when "inner_join"
            InnerJoin.from_wire_representation(representation, repository)
          when "table_projection"
            TableProjection.from_wire_representation(representation, repository)
          end
        end
      end
      include ForwardsArrayMethodsToRecords

      attr_writer :exposed_name
      delegate :include?, :map, :to => :all


      def initialize(&block)
        class_eval(&block) if block
      end

      def all
        Origin.read(self)
      end

      def find(id_or_predicate_or_hash)
        where(id_or_predicate_or_hash).first
      end

      def find_or_create(predicate)
        extant_record = find(predicate)
        if extant_record
          extant_record
        else
          create(predicate.force_matching_field_values)
        end
      end

      def [](column_or_name)
        column = column(column_or_name)
        raise "No column name #{column_or_name}" unless column
        column
      end

      def destroy(id)
        find(id).destroy
      end

      def where(predicate_or_id_or_hash, &block)
        Selection.new(self, convert_to_predicate_if_needed(predicate_or_id_or_hash), &block)
      end

      def order_by(*sort_specifications)
        Ordering.new(self, sort_specifications)
      end

      def group_by(*grouping_columns)
        Grouping.new(self, grouping_columns)
      end

      def join(right_operand)
        PartiallyConstructedInnerJoin.new(self, convert_to_table_if_needed(right_operand))
      end

      def join_to(right_operand, &block)
        self.join(right_operand).on(infer_join_predicate(right_operand), &block)
      end

      def join_through(right_operand, &block)
        right_operand = convert_to_table_if_needed(right_operand)
        right_surface_table = right_operand.surface_tables.first
        self.join_to(right_operand, &block).project(right_surface_table)
      end

      def left_join(right_operand)
        PartiallyConstructedLeftJoin.new(self, convert_to_table_if_needed(right_operand))
      end

      def left_join_to(right_operand, &block)
        self.left_join(right_operand).on(infer_join_predicate(right_operand), &block)
      end

      def project(*args, &block)
        if args.size == 1 && table_or_record_class?(args.first)
          TableProjection.new(self, convert_to_table_if_needed(args.first), &block)
        else
          Projection.new(self, convert_to_columns_if_needed(args), &block)
        end
      end

      def to_sql
        sql_query_specification.to_sql
      end

      def update(column_assignments)
        Origin.execute_dui(to_update_sql(column_assignments))
      end

      def increment(column)
        column = column(column)
        update(column => column + 1)
      end

      def decrement(column)
        column = column(column)
        update(column => column - 1)
      end

      def to_update_sql(field_values)
        sql_update_statement(field_values).to_sql
      end

      def add_to_relational_dataset(dataset)
        all.each do |record|
          record.add_to_relational_dataset(dataset)
        end
      end

      def exposed_name
        @exposed_name || operand.exposed_name
      end

      def size
        all.size
      end

      def empty?
        all.empty?
      end

      def on_insert(&block)
        initialize_event_system
        on_insert_node.subscribe(&block)
      end

      def on_update(&block)
        initialize_event_system
        on_update_node.subscribe(&block)
      end

      def on_remove(&block)
        initialize_event_system
        on_remove_node.subscribe(&block)
      end

      def num_subscriptions
        (event_nodes || []).map {|node| node.count}.sum
      end

      def sql_joined_table_ref
        if aggregation?
          Sql::DerivedTable.new(sql_query_specification, "derived_fixme")
        else
          sql_from_table_ref
        end
      end

      protected
      attr_reader :on_insert_node, :on_update_node, :on_remove_node, :event_nodes, :operand_subscriptions

      def initialize_event_system
        if event_nodes.nil?
          @on_insert_node = Util::SubscriptionNode.new
          @on_update_node = Util::SubscriptionNode.new
          @on_remove_node = Util::SubscriptionNode.new
          @event_nodes = [on_insert_node, on_update_node, on_remove_node]
        end
        initialize_operand_subscriptions if has_operands? && num_subscriptions == 0 
      end

      def initialize_operand_subscriptions
        @operand_subscriptions = Util::SubscriptionBundle.new
        subscribe_to_operands

        event_nodes.each do |node|
          node.on_unsubscribe do
            operand_subscriptions.destroy_all if num_subscriptions == 0
          end
        end
      end

      def has_operands?
        true
      end

      def table_or_record_class?(arg)
        arg.instance_of?(Table) || arg.instance_of?(Class)
      end

      def convert_to_table_if_needed(relation_or_record_class)
        if relation_or_record_class.instance_of?(Class)
          relation_or_record_class.table
        else
          relation_or_record_class
        end
      end

      def convert_to_columns_if_needed(args)
        args.map do |arg|
          if arg.is_a?(Expressions::Expression) || arg.instance_of?(Expressions::AliasedExpression)
            arg
          elsif arg.instance_of?(Symbol)
            raise "No column #{arg} found on relation" unless column = column(arg)
            column
          elsif table_or_record_class?(arg)
            convert_to_table_if_needed(arg).concrete_columns
          else
            raise "Invalid projection column: #{arg.inspect}"
          end
        end.flatten
      end

      def infer_join_predicate(right_operand)
        right_operand = convert_to_table_if_needed(right_operand)
        left_operand_surface_tables = surface_tables
        right_operand_surface_tables = right_operand.surface_tables
        unless right_operand_surface_tables.size == 1
          raise "#join_to can only be passed relations that have a single surface table"
        end

        right_surface_table = right_operand_surface_tables.first
        id_column, foreign_key_column = find_join_columns(left_operand_surface_tables.last, right_surface_table)
        id_column.eq(foreign_key_column)
      end

      def find_join_columns(table_1, table_2)
        if foreign_key = table_2.column("#{table_1.global_name.singularize}_id".to_sym)
          [table_1.column(:id), foreign_key]
        elsif foreign_key = table_1.column("#{table_2.global_name.singularize}_id".to_sym)
          [table_2.column(:id), foreign_key]
        else
          raise "No viable foreign key column found between #{table_1.global_name} and #{table_2.global_name}"
        end
      end

      def convert_to_predicate_if_needed(id_or_predicate_or_hash)
        case id_or_predicate_or_hash
        when Hash
          hash_to_predicate(id_or_predicate_or_hash)
        when Expressions::Expression
          id_or_predicate_or_hash
        else
          column(:id).eq(id_or_predicate_or_hash)
        end
      end

      def hash_to_predicate(hash)
        predicates = []
        hash.each do |key, value|
          if value.is_a?(Tuples::Tuple) && column = column("#{key}_id")
            predicates.push(column.eq(value.id))
          else

            left_operand = if key.instance_of?(Symbol)
              returning(column(key)) do |column|
                raise "No such column: #{key}" unless column
              end
            else
              key
            end

            right_operand = if value.instance_of?(Symbol)
              returning(column(value)) do |column|
                raise "No such column: #{value}" unless column
              end
            else
              value
            end

            predicates.push(left_operand.eq(right_operand))
          end
        end
        predicates.length == 1 ? predicates.first : Expressions::And.new(predicates)
      end

      def convert_keys_to_columns(hash)
        hash.transform do |key, value|
          if key.is_a?(Expressions::Column)
            [key, value]
          elsif column = column(key)
            [column, value]
          end
        end
      end

      delegate :sql_set_quantifier, :sql_sort_specifications, :sql_grouping_column_refs, :aggregation?, :to => :operand

      def sql_query_specification
        Sql::QuerySpecification.new(sql_set_quantifier, sql_select_list, sql_from_table_ref, sql_where_clause_predicates, sql_sort_specifications, sql_grouping_column_refs)
      end

      def sql_update_statement(field_values)
        Sql::UpdateStatement.new(sql_set_clause_assignments(field_values), sql_from_table_ref, sql_where_clause_predicates)
      end

      def sql_set_clause_assignments(field_values)
        convert_keys_to_columns(field_values).transform do |column, value|
          [column.sql_expression, value.sql_expression]
        end
      end

      class PartiallyConstructedInnerJoin
        attr_reader :left_operand, :right_operand
        def initialize(left_operand, right_operand)
          @left_operand, @right_operand = left_operand, right_operand
        end

        def on(predicate, &block)
          InnerJoin.new(left_operand, right_operand, predicate, &block)
        end
      end

      class PartiallyConstructedLeftJoin
        attr_reader :left_operand, :right_operand
        def initialize(left_operand, right_operand)
          @left_operand, @right_operand = left_operand, right_operand
        end

        def on(predicate, &block)
          LeftOuterJoin.new(left_operand, right_operand, predicate, &block)
        end
      end
    end
  end
end

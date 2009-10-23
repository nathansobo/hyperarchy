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
      delegate :include?, :to => :all


      def initialize(&block)
        class_eval(&block) if block
      end

      def all
        Origin.read(self)
      end

      def find(id_or_predicate)
        predicate = (id_or_predicate.is_a?(Predicates::Predicate)? id_or_predicate : column(:id).eq(id_or_predicate))
        where(predicate).all.first
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

      def where(predicate, &block)
        Selection.new(self, predicate, &block)
      end

      def join(right_operand, &block)
        PartiallyConstructedInnerJoin.new(self, convert_to_table_if_needed(right_operand), &block)
      end

      def project(*args, &block)
        if args.size == 1 && table_or_record_class?(args.first)
          TableProjection.new(self, convert_to_table_if_needed(args.first), &block)
        else
          Projection.new(self, convert_to_projected_columns_if_needed(args), &block)
        end
      end

      def aggregate(*args, &block)
        Aggregation.new(self, args, &block)
      end

      def to_sql
        build_sql_query.to_sql
      end

      def add_to_relational_dataset(dataset)
        dataset[exposed_name] ||= {}
        all.each do |record|
          dataset[exposed_name][record.id] = record.wire_representation
        end
      end

      def exposed_name
        @exposed_name || operand.exposed_name
      end

      def size
        all.size
      end

      protected
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

      def convert_to_projected_columns_if_needed(args)
        args.map do |arg|
          if arg.instance_of?(Column)
            ProjectedColumn.new(arg)
          elsif table_or_record_class?(arg)
            convert_to_table_if_needed(arg).columns.map {|c| ProjectedColumn.new(c)}
          else
            arg
          end
        end.flatten
      end
      
      class PartiallyConstructedInnerJoin
        attr_reader :left_operand, :right_operand
        def initialize(left_operand, right_operand)
          @left_operand, @right_operand = left_operand, right_operand
        end

        def on(predicate)
          InnerJoin.new(left_operand, right_operand, predicate)
        end
      end
    end
  end
end

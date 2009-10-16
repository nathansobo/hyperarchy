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

      delegate :composite?, :column, :to => :operand
      delegate :include?, :to => :records

      def where(predicate)
        Selection.new(self, predicate)
      end

      def join(right_operand)
        PartiallyConstructedInnerJoin.new(self, convert_to_table_if_needed(right_operand))
      end

      def project(*args, &block)
        if args.size == 1 && table_or_record_class?(args.first)
          TableProjection.new(self, convert_to_table_if_needed(args.first))
        else
          Projection.new(self, convert_to_projected_columns_if_needed(args), &block)
        end
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

      def find(id_or_predicate)
        predicate = (id_or_predicate.is_a?(Predicates::Predicate)? id_or_predicate : record_class[:id].eq(id_or_predicate))
        where(predicate).records.first
      end

      def find_or_create(predicate)
        extant_record = find(predicate)
        if extant_record
          extant_record
        else
          create(predicate.force_matching_field_values)
        end
      end


      def records
        Origin.read(self)
      end

      def to_sql
        build_sql_query.to_sql
      end

      def table
        raise "Can only call #table on non-composite relations" if composite?
        constituent_tables.first
      end

      def add_to_relational_dataset(dataset)
        dataset[exposed_name] ||= {}
        records.each do |record|
          dataset[exposed_name][record.id] = record.wire_representation
        end
      end

      def exposed_name
        @exposed_name || operand.exposed_name
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

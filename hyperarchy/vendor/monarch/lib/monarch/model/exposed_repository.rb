module Monarch
  module Model
    class ExposedRepository
      include Util::BuildRelationalDataset

      cattr_accessor :unique_id_mutex
      self.unique_id_mutex = Mutex.new

      class << self
        def expose(name, &relation_definition)
          exposed_relation_definitions_by_name[name] = relation_definition
          define_method name do
            get_view(name)
          end
        end

        def exposed_relation_definitions_by_name
          @exposed_relation_definitions_by_name ||= HashWithIndifferentAccess.new
        end

        def next_unique_id
          unique_id_mutex.synchronize do
            @next_unique_id ||= 0
            @next_unique_id += 1
          end
        end
      end

      def fetch(relation_wire_representations)
        Repository.transaction do
          begin
            build_relations_from_wire_representations(relation_wire_representations)
          ensure
            drop_views
          end
        end
      end

      def mutate(operations)
        perform_operations_in_transaction(operations)
      end

      def subscribe(real_time_client, relation_wire_representations)
        subscription_guids = build_relations_from_wire_representations(relation_wire_representations).map do |relation|
          real_time_client.subscribe(relation)
        end
        return true, subscription_guids
      end

      def unsubscribe(real_time_client, subscription_ids)
        subscription_ids.each do |subscription_id|
          real_time_client.unsubscribe(subscription_id)
        end
        true
      end

      def perform_operations_in_transaction(operations)
        successful = true
        response_data = { 'primary' => [], 'secondary' => [] }

        Repository.transaction do
          operations.each_with_index do |operation, index|
            result = perform_operation(operation)
            if result.valid?
              response_data['primary'].push(result.data)
            else
              successful = false
              response_data = {
                'index' => index,
                'errors' => result.data
              }
              raise Sequel::Rollback
            end
          end
        end
        [successful, response_data]
      ensure
        drop_views
      end

      def get_view(name)
        if view = exposed_views_by_name[name]
          return view
        end
        relation_definition = exposed_relation_definitions_by_name[name]
        raise "No table named #{name} defined in #{inspect}" unless relation_definition
        view = instance_eval(&relation_definition).view("#{name}_#{unique_id}")
        view.create_view(:temporary)

        view.exposed_name = name
        exposed_views_by_name[name] = view
      end

      def drop_views
        exposed_views_by_name.values.each(&:drop_view)
        @exposed_views_by_name = {}
      end

      def unique_id
        @unique_id ||= self.class.next_unique_id
      end

      protected

      def perform_operation(operation)
        operation_type = operation.shift

        case operation_type
        when 'create'
          perform_create(*operation)
        when 'update'
          perform_update(*operation)
        when 'destroy'
          perform_destroy(*operation)
        end
      end

      def perform_create(table_name, field_values)
        relation = get_view(table_name)
        record = relation.build(field_values)

        unless record.can_create? && record.can_create_with_columns?(field_values.keys)
          raise Monarch::Unauthorized
        end

        if record.save
          valid_result(record.wire_representation)
        else
          invalid_result(record.validation_errors_by_column_name.stringify_keys)
        end
      end

      def perform_update(table_name, id, field_values)
        relation = get_view(table_name)
        record = relation.find(id)
        record.soft_update_fields(field_values)

        unless record.can_update? && record.can_update_columns?(field_values.keys)
          raise Monarch::Unauthorized, "Not allowed to perform update: #{table_name}, #{id}, #{field_values.inspect}"
        end

        if record.save
          if relation.find(id)
            return valid_result(record.wire_representation.stringify_keys)
          else
            return invalid_result("Security violation")
          end
        else
          return invalid_result(record.validation_errors_by_column_name.stringify_keys)
        end
      end

      def perform_destroy(table_name, id)
        relation = get_view(table_name)
        record = relation.find(id)
        raise Monarch::Unauthorized unless record.can_destroy?
        record.destroy
        valid_result(nil)
      end

      def headers
        { 'Content-Type' => 'application/json' }
      end

      def build_relations_from_wire_representations(representations)
        representations.map do |representation|
          build_relation_from_wire_representation(representation)
        end
      end

      def build_relation_from_wire_representation(representation)
        Relations::Relation.from_wire_representation(representation, self)
      end

      def exposed_views_by_name
        @exposed_views_by_name ||= HashWithIndifferentAccess.new
      end

      def exposed_relation_definitions_by_name
        self.class.exposed_relation_definitions_by_name
      end

      def valid_result(data)
        OperationResult.new(true, data)
      end

      def invalid_result(data)
        OperationResult.new(false, data)
      end

      class OperationResult
        attr_reader :data

        def initialize(valid, data)
          @valid, @data = valid, data
        end

        def valid?
          @valid
        end
      end

      class SecurityException < Exception
      end
    end
  end
end
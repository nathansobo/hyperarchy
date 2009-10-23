module Model
  class ExposedRepository < ::Http::Resource
    class << self
      def expose(name, &relation_definition)
        exposed_relation_definitions_by_name[name] = relation_definition
      end

      def exposed_relation_definitions_by_name
        @exposed_relation_definitions_by_name ||= HashWithIndifferentAccess.new
      end
    end

    def get(params)
      relation_wire_representations = JSON.parse(params[:relations])
      [200, headers, { :successful => true, :data => fetch(relation_wire_representations)}.to_json]
    end

    def put(params)
      id = params[:id]
      relation = build_relation_from_wire_representation(JSON.parse(params[:relation]))
      field_values = JSON.parse(params[:field_values])
      record = relation.find(id)
      updated_field_values = record.update(field_values)
      record.save

      [200, headers, { :successful => true, :data => {:field_values => updated_field_values}}.to_json]
    end

    def post(params)
      relation = build_relation_from_wire_representation(JSON.parse(params[:relation]))
      field_values = JSON.parse(params[:field_values])
      new_record = relation.create(field_values)
      
      [200, headers, { :successful => true, :data => {:field_values => new_record.wire_representation}}.to_json]
    end

    def delete(params)
      id = params[:id]
      relation = build_relation_from_wire_representation(JSON.parse(params[:relation]))
      relation.destroy(id)

      [200, headers, { :successful => true }.to_json]
    end

    def resolve_table_name(name)
      if relation = exposed_relations_by_name[name]
        return relation
      end
      relation_definition = exposed_relation_definitions_by_name[name]
      raise "No table named #{name} defined in #{inspect}" unless relation_definition
      relation = instance_eval(&relation_definition)
      relation.exposed_name = name
      exposed_relations_by_name[name] = relation
    end
    
    protected

    def headers
      { 'Content-Type' => 'application/json' }
    end

    def fetch(relation_wire_representations)
      dataset = {}
      relation_wire_representations.each do |representation|
        build_relation_from_wire_representation(representation).add_to_relational_dataset(dataset)
      end
      dataset
    end

    def build_relation_from_wire_representation(representation)
      Relations::Relation.from_wire_representation(representation, self)
    end

    def exposed_relations_by_name
      @exposed_relations_by_name ||= HashWithIndifferentAccess.new
    end

    def exposed_relation_definitions_by_name
      self.class.exposed_relation_definitions_by_name
    end
  end
end

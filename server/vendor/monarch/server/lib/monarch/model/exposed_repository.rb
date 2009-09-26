module Model
  class ExposedRepository < ::Http::Resource
    class << self
      def expose(name, &relation_definition)
        exposed_relations[name] = relation_definition
      end

      def exposed_relations
        @exposed_relations ||= HashWithIndifferentAccess.new
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

    def headers
      { 'Content-Type' => 'application/json' }
    end

    def fetch(relation_wire_representations)
      snapshot = {}
      relation_wire_representations.each do |representation|
        add_to_relational_snapshot(snapshot, build_relation_from_wire_representation(representation))
      end
      snapshot
    end

    def build_relation_from_wire_representation(representation)
      Relations::Relation.from_wire_representation(representation, self)
    end

    def add_to_relational_snapshot(snapshot, relation)
      table_name = relation.record_class.table.global_name.to_s
      snapshot[table_name] ||= {}
      relation.record_wire_representations.each do |representation|
        snapshot[table_name][representation["id"]] = representation
      end
    end

    def resolve_table_name(name)
      relation_definition = exposed_relations[name]
      raise "No table named #{name} defined in #{inspect}" unless relation_definition
      instance_eval(&relation_definition)
    end

    def exposed_relations
      self.class.exposed_relations
    end
  end
end

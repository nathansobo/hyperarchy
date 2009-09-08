module Model
  module RemoteQueryable
    def get(params)
      relation_wire_representations = JSON.parse(params["relations"])
      [200, { 'Content-Type' => 'application/json' }, fetch(relation_wire_representations).to_json]
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
  end
end

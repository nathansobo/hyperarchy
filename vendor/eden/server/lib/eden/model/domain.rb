module Model
  module Domain
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
      set_name = relation.tuple_class.set.global_name.to_s
      snapshot[set_name] ||= {}
      relation.tuple_wire_representations.each do |representation|
        snapshot[set_name][representation["id"]] = representation
      end
    end
  end
end
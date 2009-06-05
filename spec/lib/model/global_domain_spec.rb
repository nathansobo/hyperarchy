require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Model
  describe GlobalDomain do
    describe "#build_relation_from_wire_representation" do
      it "resolves relation names to primitive Sets" do
        relation = GlobalDomain.instance.build_relation_from_wire_representation({
          "type" => "set",
          "name" => "candidates"
        })
        relation.should == Candidate.set
      end
    end

    describe "#get" do
      it "parses the 'relations' paramater from a JSON string into an array of wire representations and performs a #fetch with it, returning the resulting snapshot as a JSON string" do
        relations = [{ "type" => "set", "name" => "candidates"}]

        snapshot = nil
        mock.proxy(GlobalDomain.instance).fetch(relations) {|result| snapshot = result}

        response = GlobalDomain.instance.get({"relations" => relations.to_json})

        response.should == [200, { 'Content-Type' => 'application/json'}, snapshot.to_json]
      end
    end

    describe "#locate" do
      it "returns the Set with the given #global_name" do
        GlobalDomain.instance.locate("groups").should == GlobalDomain.sets_by_name[:groups]
      end
    end

    describe "#initialize_identity_maps" do
      it "calls #initialize_identity_map on every Set" do
        GlobalDomain.sets.each do |set|
          mock(set).initialize_identity_map
        end
        GlobalDomain.initialize_identity_maps
      end
    end

    describe "#clear_identity_maps" do
      it "calls #clear_identity_map on every Set" do
        GlobalDomain.sets.each do |set|
          mock(set).clear_identity_map
        end
¼        GlobalDomain.clear_identity_maps
      end
    end
  end
end
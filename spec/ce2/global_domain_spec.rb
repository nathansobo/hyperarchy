require File.expand_path("#{File.dirname(__FILE__)}/ce2_spec_helper")

describe GlobalDomain do
  describe "#build_relation_from_wire_representation" do
    it "resolves relation names to primitive Sets" do
      relation = GlobalDomain.instance.build_relation_from_wire_representation({
        "type" => "set",
        "name" => "answers"
      })
      relation.should == Answer.set
    end
  end

  describe "#get" do
    it "parses the 'relations' paramater from a JSON string into an array of wire representations and performs a #fetch with it, returning the resulting snapshot as a JSON string" do
      relations = [{ "type" => "set", "name" => "answers"}]

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
end
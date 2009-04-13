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
end
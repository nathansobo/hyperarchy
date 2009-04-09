require File.expand_path("#{File.dirname(__FILE__)}/ce2_spec_helper")

describe Attribute do
  describe "#to_sql" do
    it "returns the qualified attribute name" do
      Answer.correct.to_sql.should == "answers.correct"
    end
  end
end
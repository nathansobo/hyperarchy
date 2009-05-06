require File.expand_path("#{File.dirname(__FILE__)}/../hyperarchy_spec_helper")

describe Field do
  attr_reader :field
  before do
    @field = Candidate.new.fields_by_attribute[Candidate.body]
  end

  describe "#value=" do
    it "sets #value to the result of #attribute.convert_value on the given value" do
      mock(field.attribute).convert_value("foo") { "bar" }
      field.value=("foo")
      field.value.should == "bar"
    end
  end
end
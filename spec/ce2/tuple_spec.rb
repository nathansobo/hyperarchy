require File.expand_path("#{File.dirname(__FILE__)}/ce2_spec_helper")

describe Tuple do
  describe "metaprogramatic functionality" do
    describe "when a subclass in created" do
      it "assigns its .set to a new Set with the underscored-pluralized name of the class as its #global_name" do
        Answer.set.global_name.should == :answers
      end

      it "adds its assigned .set to Domain #sets_by_name" do
        Domain.sets_by_name[:answers].should == Answer.set
        Domain.sets_by_name[:answers].tuple_class.should == Answer
      end
    end

    describe ".attribute" do
      it "delegates attribute definition to .set" do
        mock(Answer.set).define_attribute(:foo, :string)
        Answer.attribute(:foo, :string)
      end

      it "defines a class method that refers to the Attribute defined on .set" do
        Answer.body.should == Answer.set.attributes_by_name[:body]
      end
    end
  end
end
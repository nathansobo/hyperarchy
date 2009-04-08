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

      it "defines named instance methods that call #set_field_value and #get_field_value" do
        tuple = Answer.new

        mock.proxy(tuple).set_field_value(Answer.body, "Barley")
        tuple.body = "Barley"
        mock.proxy(tuple).get_field_value(Answer.body)
        tuple.body.should  == "Barley"
      end
    end
  end

  describe "#initialize" do
    it "assigns #fields_by_attribute to a hash with a Field object for every attribute declared in the set" do
      tuple = Answer.new
      Answer.set.attributes.each do |attribute|
        field = tuple.fields_by_attribute[attribute]
        field.attribute.should == attribute
        field.tuple.should == tuple
      end
    end

    it "assigns the Field values in the given hash" do
      tuple = Answer.new(:body => "Quinoa", :correct => true)
      tuple.get_field_value(Answer.body).should == "Quinoa"
      tuple.get_field_value(Answer.correct).should == true
    end
  end

  describe "#set_field_value and #get_field_value" do
    specify "set and get a Field value" do
      tuple = Answer.new
      tuple.set_field_value(Answer.body, "Quinoa")
      tuple.get_field_value(Answer.body).should == "Quinoa" 
    end
  end
end
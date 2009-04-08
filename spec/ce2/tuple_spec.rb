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

      it "defines an :id Attribute on the subclass" do
        Answer.id.class.should == Attribute
        Answer.id.name.should == :id
        Answer.id.type.should == :string
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

  describe "class methods" do
    describe ".create" do
      it "deletages to .set" do
        attributes = { :body => "Amaranth" }
        mock(Answer.set).create(attributes)
        Answer.create(attributes)
      end
    end

    describe ".unsafe_new" do
      it "instantiates a Tuple with the given field values without overriding the value of :id" do
        tuple = Answer.unsafe_new(:id => "foo", :body => "Rice")
        tuple.id.should == "foo"
        tuple.body.should == "Rice"
      end
    end
  end

  describe "instance methods" do
    attr_reader :tuple
    before do
      @tuple = Answer.new(:body => "Quinoa", :correct => true)
    end

    describe "#initialize" do
      it "assigns #fields_by_attribute to a hash with a Field object for every attribute declared in the set" do
        Answer.set.attributes.each do |attribute|
          field = tuple.fields_by_attribute[attribute]
          field.attribute.should == attribute
          field.tuple.should == tuple
        end
      end

      it "assigns the Field values in the given hash" do
        tuple.get_field_value(Answer.body).should == "Quinoa"
        tuple.get_field_value(Answer.correct).should == true
      end

      it "assigns #id to a new guid" do
        tuple.id.should_not be_nil
      end
    end

    describe "#field_values_by_attribute_name" do
      it "returns a hash with the values of all fields indexed by Attribute name" do
        expected_hash = {}
        tuple.fields_by_attribute.each do |attribute, field|
          expected_hash[attribute.name] = field.value
        end

        tuple.field_values_by_attribute_name.should == expected_hash
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
end
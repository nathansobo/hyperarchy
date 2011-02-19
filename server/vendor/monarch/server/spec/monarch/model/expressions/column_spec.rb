require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Expressions
      describe ConcreteColumn do
        include Monarch::Model

        describe "class methods" do
          describe ".from_wire_representation" do
            it "returns a ConcreteColumn based on the 'table' and 'name' of the given representation" do
              repo = UserRepository.new(User.find('jan'))

              column = ConcreteColumn.from_wire_representation({
                "type" => "column",
                "table" => "blog_posts",
                "name" => "body"
              }, repo)

              column.should ==  repo.get_view(:blog_posts).column(:body)
            end
          end
        end

        describe "instance methods" do
          describe "#eq" do
            it "returns an instance of Expressions::Eq with self as #left_operand and the argument as #right_operand" do
              predicate = BlogPost[:id].eq("grain_quinoa")
              predicate.class.should == Expressions::Eq
              predicate.left_operand.should == BlogPost[:id]
              predicate.right_operand.should == "grain_quinoa".hash
            end
          end
        end
      end
    end
  end
end
require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Predicates
    describe Eq do
      describe "class methods" do
        describe ".from_wire_representation" do
          attr_reader :wire_representation, :repository
          before do
            @wire_representation = {
              "type" => "eq",
              "left_operand" => left_operand_representation,
              "right_operand" => {
                "type" => "scalar",
                "value" => 2,
              }
            }

            @repository = UserRepository.new(User.find('jan'))
          end

          context "when both operands are scalars" do
            def left_operand_representation
              {
                "type" => "scalar",
                "value" => 1,
              }
            end

            it "returns an Eq predicate comparing the two scalars" do
              eq = Eq.from_wire_representation(wire_representation, repository)
              eq.class.should == Eq
              eq.left_operand.should == 1
              eq.right_operand.should == 2
            end
          end

          context "when one of the operands is an column" do
            def left_operand_representation
              {
                "type" => "column",
                "table" => "super_blog_posts",
                "name" => "body"
              }
            end

            it "returns an Eq predicate with the indicated column as one of its operands" do
              eq = Eq.from_wire_representation(wire_representation, repository)
              eq.class.should == Eq
              eq.left_operand.should == repository.resolve_table_name(:super_blog_posts).column(:body)
              eq.right_operand.should == 2
            end
          end
        end
      end
    end
  end
end

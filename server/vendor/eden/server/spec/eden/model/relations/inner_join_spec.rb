require File.expand_path("#{File.dirname(__FILE__)}/../../../eden_spec_helper")

module Model
  module Relations
    describe InnerJoin do
      describe ".from_wire_representation" do
        it "builds an InnerJoin with its operands resolved in the given subdomain" do
          subdomain = User.find("nathan")
          representation = {
            "type" => "inner_join",
            "left_operand" => {
              "type" => "set",
              "name" => "blogs"
            },
            "right_operand" => {
              "type" => "set",
              "name" => "candidates"
            },
            "predicate" => {
              "type" => "eq",
              "left_operand" => {
                "type" => "column",
                "set" => "blogs",
                "name" => "id"
              },
              "right_operand" => {
                "type" => "column",
                "set" => "candidates",
                "name" => "blog_id"
              }
            }
          }

          join = InnerJoin.from_wire_representation(representation, subdomain)
          join.class.should == InnerJoin
          join.left_operand.should == subdomain.blogs
          join.right_operand.should == subdomain.candidates
          join.predicate.left_operand.should == Blog[:id]
          join.predicate.right_operand.should == Candidate[:blog_id]
        end
      end
    end
  end
end

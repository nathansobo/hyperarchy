require File.expand_path("#{File.dirname(__FILE__)}/../../../hyperarchy_spec_helper")

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
              "name" => "elections"
            },
            "right_operand" => {
              "type" => "set",
              "name" => "candidates"
            },
            "predicate" => {
              "type" => "eq",
              "left_operand" => {
                "type" => "attribute",
                "set" => "elections",
                "name" => "id"
              },
              "right_operand" => {
                "type" => "attribute",
                "set" => "candidates",
                "name" => "election_id"
              }
            }
          }

          join = InnerJoin.from_wire_representation(representation, subdomain)
          join.class.should == InnerJoin
          join.left_operand.should == subdomain.elections
          join.right_operand.should == subdomain.candidates
          join.predicate.left_operand.should == Election.id
          join.predicate.right_operand.should == Candidate.election_id
        end
      end
    end
  end
end
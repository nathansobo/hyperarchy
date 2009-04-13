require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Relations
  describe InnerJoin do
    describe ".from_wire_representation" do
      it "builds an InnerJoin with its operands resolved in the given subdomain" do
        subdomain = Group.find("dating")
        representation = {
          "type" => "inner_join",
          "left_operand" => {
            "type" => "set",
            "name" => "questions"
          },
          "right_operand" => {
            "type" => "set",
            "name" => "answers"
          },
          "predicate" => {
            "type" => "eq",
            "left_operand" => {
              "type" => "attribute",
              "set" => "questions",
              "name" => "id"
            },
            "right_operand" => {
              "type" => "attribute",
              "set" => "answers",
              "name" => "question_id"
            }
          }
        }

        join = InnerJoin.from_wire_representation(representation, subdomain)
        join.class.should == InnerJoin
        join.left_operand.should == subdomain.questions
        join.right_operand.should == subdomain.answers
        join.predicate.left_operand.should == Question.id
        join.predicate.right_operand.should == Answer.question_id
      end
    end
  end
end
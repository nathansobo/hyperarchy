require 'spec_helper'

describe Sandbox, :type => :model do
  attr_reader :question, :repository, :user_1, :user_2, :answer_1, :answer_2

  before do
    set_current_user(User.make!)
    @user_1 = User.make!
    @user_2 = User.make!
    @question = Question.make!
    @answer_1 = question.answers.make!(:creator => user_1)
    @answer_2 = question.answers.make!(:creator => user_2)
    @repository = Sandbox.new(current_user)
  end

  it "correctly interprets a join from answers on a given question to their users" do
    wire_reps = [
      {"type" => "inner_join",
       "left_operand" =>
        {"type" => "selection",
         "operand" => {"type" => "table", "name" => "answers"},
         "predicate" =>
          {"type" => "eq",
           "left_operand" => {"type" => "column", "table" => "answers", "name" => "question_id"},
           "right_operand" => {"type" => "scalar", "value" => question.id}}},
       "right_operand" => {"type" => "table", "name" => "users"},
       "predicate" =>
        {"type" => "eq",
         "left_operand" => {"type" => "column", "table" => "answers", "name" => "creator_id"},
         "right_operand" => {"type" => "column", "table" => "users", "name" => "id"}}}
    ]

    dataset = repository.fetch(*wire_reps)
    dataset["users"].should have_key(user_1.to_param)
    dataset["users"].should have_key(user_2.to_param)
    dataset["answers"].should have_key(answer_1.to_param)
    dataset["answers"].should have_key(answer_2.to_param)
  end
end

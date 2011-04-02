require 'spec_helper'

describe Sandbox do

  attr_reader :election, :repository, :user_1, :user_2, :candidate_1, :candidate_2

  before do
    org = Organization.make
    current_user = make_member(org)

    @user_1 = make_member(org)
    @user_2 = make_member(org)

    @election = org.elections.make
    @candidate_1 = election.candidates.make(:creator => user_1)
    @candidate_2 = election.candidates.make(:creator => user_2)

    @repository = Sandbox.new(current_user)
  end

  it "correctly interprets a join from candidates on a given election to their users" do
    wire_reps = [
      {"type" => "inner_join",
       "left_operand" =>
        {"type" => "selection",
         "operand" => {"type" => "table", "name" => "candidates"},
         "predicate" =>
          {"type" => "eq",
           "left_operand" => {"type" => "column", "table" => "candidates", "name" => "election_id"},
           "right_operand" => {"type" => "scalar", "value" => election.id}}},
       "right_operand" => {"type" => "table", "name" => "users"},
       "predicate" =>
        {"type" => "eq",
         "left_operand" => {"type" => "column", "table" => "candidates", "name" => "creator_id"},
         "right_operand" => {"type" => "column", "table" => "users", "name" => "id"}}}
    ]

    dataset = repository.fetch(*wire_reps)
    dataset["users"].should have_key(user_1.to_param)
    dataset["users"].should have_key(user_2.to_param)
    dataset["candidates"].should have_key(candidate_1.to_param)
    dataset["candidates"].should have_key(candidate_2.to_param)
  end
end


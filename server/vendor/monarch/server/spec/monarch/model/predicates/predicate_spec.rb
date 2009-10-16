require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Predicates
    describe Predicate do
      describe ".from_wire_representation" do
        context "when 'type' is 'eq'" do
          it "delegates to .from_wire_representation on Predicates::Eq" do
            wire_representation = {
              "type" => "eq",
              "left_operand" => {
                "type" => "scalar",
                "value" => 1,
              },
              "right_operand" => {
                "type" => "scalar",
                "value" => 2,
              }
            }

            repository = Object.new
            mock(Eq).from_wire_representation(wire_representation, repository)
            Predicate.from_wire_representation(wire_representation, repository)
          end
        end
      end
    end
  end
end

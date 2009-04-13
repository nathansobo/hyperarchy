require File.expand_path("#{File.dirname(__FILE__)}/../ce2_spec_helper")

module Predicates
  describe Predicate do
    describe ".from_wire_representation" do
      context "when 'type' is 'eq'" do
        it "delegates to .from_wire_format on Predicates::Eq" do
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

          mock(Eq).from_wire_representation(wire_representation)
          Predicate.from_wire_representation(wire_representation)
        end
      end
    end

  end
end
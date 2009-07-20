require File.expand_path("#{File.dirname(__FILE__)}/../../../hyperarchy_spec_helper")

module Model
  module Relations
    describe Relation do
      describe "class methods" do
        describe "#from_wire_representation" do
          attr_reader :subdomain
          before do
            @subdomain = User.find("nathan")
          end

          context "when the given representation's type is 'set'" do
            it "resolves the name of the set in the given subdomain" do
              relation = Relation.from_wire_representation({
                "type" => "set",
                "name" => "candidates"
              }, subdomain)
              relation.should == subdomain.candidates
            end
          end

          context "when the given representation's type is 'selection'" do
            it "delegates to Selection.from_wire_representation" do
              representation = {
                "type" => "selection",
                "operand" => {
                  "type" => "set",
                  "name" => "answers"
                },
                "predicate" => {
                  "type" => "eq",
                  "left_operand" => {
                    "type" => "attribute",
                    "set" => "answers",
                    "name" => "correct"
                  },
                  "right_operand" => {
                    "type" => "scalar",
                    "value" => true
                  }
                }
              }
              mock(Selection).from_wire_representation(representation, subdomain)
              Relation.from_wire_representation(representation, subdomain)
            end
          end

          context "when the given representation's type is 'inner_join'" do
            it "delegates to InnerJoin.from_wire_representation" do
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

              mock(InnerJoin).from_wire_representation(representation, subdomain)
              Relation.from_wire_representation(representation, subdomain)
            end
          end

          context "when the given representation's type is 'set_projection'" do
            it "delegates to SetProjection.from_wire_representation" do
              representation = {
                "type" => "set_projection",
                "projected_set" => "answers",
                "operand" => {
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
              }

              mock(SetProjection).from_wire_representation(representation, subdomain)
              Relation.from_wire_representation(representation, subdomain)
            end
          end
        end
      end

      describe "instance methods" do
        describe "#where" do
          it "returns a Selection with self as #operand and the given Predicate as #predicate" do
            predicate = Candidate[:id].eq("grain_quinoa")
            selection = Candidate.set.where(predicate)
            selection.class.should == Selection
            selection.operand.should == Candidate.set
            selection.predicate.should == predicate
          end
        end

        describe "#join, #on" do
          context "when passed a Set" do
            it "returns an InnerJoin with self as #left_operand and the given Relation as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = Candidate[:election_id].eq(Election[:id])
              join = Election.set.join(Candidate.set).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Election.set
              join.right_operand.should == Candidate.set
              join.predicate.should == predicate
            end
          end

          context "when passed a subclass of Tuple" do
            it "returns an InnerJoin with self as #left_operand and the #set of the given Tuple subclass as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = Candidate[:election_id].eq(Election[:id])
              join = Election.set.join(Candidate).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Election.set
              join.right_operand.should == Candidate.set
              join.predicate.should == predicate
            end
          end
        end

        describe "#project" do
          context "when passed a Set" do
            it "returns a SetProjection with self as #operand and the given Set as its #projected_set" do
              join = Election.set.join(Candidate.set).on(Candidate[:election_id].eq(Election[:id]))
              projection = join.project(Candidate.set)
              projection.class.should == SetProjection
              projection.operand.should == join
              projection.projected_set.should == Candidate.set
            end
          end

          context "when passed a subclass of Tuple" do
            it "returns a SetProjection with self as #operand and the #set of the given Tuple subclass as its #projected_set" do
              join = Election.set.join(Candidate.set).on(Candidate[:election_id].eq(Election[:id]))
              projection = join.project(Candidate)
              projection.class.should == SetProjection
              projection.operand.should == join
              projection.projected_set.should == Candidate.set
            end
          end
        end

        describe "#find" do
          context "when passed an id" do
            it "returns the first Tuple in a Selection where id is equal to the given id" do
              Candidate.set.find("grain_quinoa").should == Candidate.set.where(Candidate[:id].eq("grain_quinoa")).tuples.first
            end
          end

          context "when passed a Predicate" do
            it "returns the first Tuple in the Relation that matches the Predicate" do
              Candidate.set.find(Candidate[:body].eq("Millet")).should == Candidate.where(Candidate[:body].eq("Millet")).tuples.first
            end
          end
        end


        describe "#tuple_wire_representations" do
          it "returns the #wire_representation of all its #tuples" do
            Candidate.set.tuple_wire_representations.should == Candidate.set.tuples.map {|t| t.wire_representation}
          end
        end

        describe "#each" do
          specify "delegates to #tuples of #set" do
            tuples = []
            stub(Candidate.set).tuples { tuples }

            block = lambda {}
            mock(tuples).each(&block)
            Candidate.set.each(&block)
          end
        end
      end
    end
  end
end
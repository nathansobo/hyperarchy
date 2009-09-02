require File.expand_path("#{File.dirname(__FILE__)}/../../../eden_spec_helper")

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
                "name" => "blog_posts"
              }, subdomain)
              relation.should == subdomain.blog_posts
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
                    "type" => "column",
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
                    "type" => "column",
                    "set" => "questions",
                    "name" => "id"
                  },
                  "right_operand" => {
                    "type" => "column",
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
                      "type" => "column",
                      "set" => "questions",
                      "name" => "id"
                    },
                    "right_operand" => {
                      "type" => "column",
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
            predicate = BlogPost[:id].eq("grain_quinoa")
            selection = BlogPost.set.where(predicate)
            selection.class.should == Selection
            selection.operand.should == BlogPost.set
            selection.predicate.should == predicate
          end
        end

        describe "#join, #on" do
          context "when passed a Set" do
            it "returns an InnerJoin with self as #left_operand and the given Relation as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = BlogPost[:blog_id].eq(Blog[:id])
              join = Blog.set.join(BlogPost.set).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Blog.set
              join.right_operand.should == BlogPost.set
              join.predicate.should == predicate
            end
          end

          context "when passed a subclass of Tuple" do
            it "returns an InnerJoin with self as #left_operand and the #set of the given Tuple subclass as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = BlogPost[:blog_id].eq(Blog[:id])
              join = Blog.set.join(BlogPost).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Blog.set
              join.right_operand.should == BlogPost.set
              join.predicate.should == predicate
            end
          end
        end

        describe "#project" do
          context "when passed a Set" do
            it "returns a SetProjection with self as #operand and the given Set as its #projected_set" do
              join = Blog.set.join(BlogPost.set).on(BlogPost[:blog_id].eq(Blog[:id]))
              projection = join.project(BlogPost.set)
              projection.class.should == SetProjection
              projection.operand.should == join
              projection.projected_set.should == BlogPost.set
            end
          end

          context "when passed a subclass of Tuple" do
            it "returns a SetProjection with self as #operand and the #set of the given Tuple subclass as its #projected_set" do
              join = Blog.set.join(BlogPost.set).on(BlogPost[:blog_id].eq(Blog[:id]))
              projection = join.project(BlogPost)
              projection.class.should == SetProjection
              projection.operand.should == join
              projection.projected_set.should == BlogPost.set
            end
          end
        end

        describe "#find" do
          context "when passed an id" do
            it "returns the first Tuple in a Selection where id is equal to the given id" do
              BlogPost.set.find("grain_quinoa").should == BlogPost.set.where(BlogPost[:id].eq("grain_quinoa")).tuples.first
            end
          end

          context "when passed a Predicate" do
            it "returns the first Tuple in the Relation that matches the Predicate" do
              BlogPost.set.find(BlogPost[:body].eq("Millet")).should == BlogPost.where(BlogPost[:body].eq("Millet")).tuples.first
            end
          end
        end


        describe "#tuple_wire_representations" do
          it "returns the #wire_representation of all its #tuples" do
            BlogPost.set.tuple_wire_representations.should == BlogPost.set.tuples.map {|t| t.wire_representation}
          end
        end

        describe "#each" do
          specify "delegates to #tuples of #set" do
            tuples = []
            stub(BlogPost.set).tuples { tuples }

            block = lambda {}
            mock(tuples).each(&block)
            BlogPost.set.each(&block)
          end
        end
      end
    end
  end
end

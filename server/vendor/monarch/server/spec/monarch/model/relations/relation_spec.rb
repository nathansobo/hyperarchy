require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Relation do
      describe "class methods" do
        describe "#from_wire_representation" do
          attr_reader :exposed_repository
          before do
            @exposed_repository = UserRepository.new(User.find("jan"))
          end

          context "when the given representation's type is 'table'" do
            it "resolves the name of the table in the given repository" do
              relation = Relation.from_wire_representation({
                "type" => "table",
                "name" => "blog_posts"
              }, exposed_repository)
              relation.should == exposed_repository.resolve_table_name(:blog_posts)
            end
          end

          context "when the given representation's type is 'selection'" do
            it "delegates to Selection.from_wire_representation" do
              representation = {
                "type" => "selection",
                "operand" => {
                  "type" => "table",
                  "name" => "answers"
                },
                "predicate" => {
                  "type" => "eq",
                  "left_operand" => {
                    "type" => "column",
                    "table" => "answers",
                    "name" => "correct"
                  },
                  "right_operand" => {
                    "type" => "scalar",
                    "value" => true
                  }
                }
              }
              mock(Selection).from_wire_representation(representation, exposed_repository)
              Relation.from_wire_representation(representation, exposed_repository)
            end
          end

          context "when the given representation's type is 'inner_join'" do
            it "delegates to InnerJoin.from_wire_representation" do
              representation = {
                "type" => "inner_join",
                "left_operand" => {
                  "type" => "table",
                  "name" => "questions"
                },
                "right_operand" => {
                  "type" => "table",
                  "name" => "answers"
                },
                "predicate" => {
                  "type" => "eq",
                  "left_operand" => {
                    "type" => "column",
                    "table" => "questions",
                    "name" => "id"
                  },
                  "right_operand" => {
                    "type" => "column",
                    "table" => "answers",
                    "name" => "question_id"
                  }
                }
              }

              mock(InnerJoin).from_wire_representation(representation, exposed_repository)
              Relation.from_wire_representation(representation, exposed_repository)
            end
          end

          context "when the given representation's type is 'table_projection'" do
            it "delegates to TableProjection.from_wire_representation" do
              representation = {
                "type" => "table_projection",
                "projected_table" => "answers",
                "operand" => {
                  "type" => "inner_join",
                  "left_operand" => {
                    "type" => "table",
                    "name" => "questions"
                  },
                  "right_operand" => {
                    "type" => "table",
                    "name" => "answers"
                  },
                  "predicate" => {
                    "type" => "eq",
                    "left_operand" => {
                      "type" => "column",
                      "table" => "questions",
                      "name" => "id"
                    },
                    "right_operand" => {
                      "type" => "column",
                      "table" => "answers",
                      "name" => "question_id"
                    }
                  }
                }
              }

              mock(TableProjection).from_wire_representation(representation, exposed_repository)
              Relation.from_wire_representation(representation, exposed_repository)
            end
          end
        end
      end

      describe "instance methods" do
        describe "#where" do
          it "returns a Selection with self as #operand and the given Predicate as #predicate" do
            predicate = BlogPost[:id].eq("grain_quinoa")
            selection = BlogPost.table.where(predicate)
            selection.class.should == Selection
            selection.operand.should == BlogPost.table
            selection.predicate.should == predicate
          end
        end

        describe "#join, #on" do
          context "when passed a Table" do
            it "returns an InnerJoin with self as #left_operand and the given Relation as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = BlogPost[:blog_id].eq(Blog[:id])
              join = Blog.table.join(BlogPost.table).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Blog.table
              join.right_operand.should == BlogPost.table
              join.predicate.should == predicate
            end
          end

          context "when passed a subclass of Record" do
            it "returns an InnerJoin with self as #left_operand and the #table of the given Record subclass as #right_operand, then the Predicate passed to .on as its #predicate" do
              predicate = BlogPost[:blog_id].eq(Blog[:id])
              join = Blog.table.join(BlogPost).on(predicate)
              join.class.should == InnerJoin
              join.left_operand.should == Blog.table
              join.right_operand.should == BlogPost.table
              join.predicate.should == predicate
            end
          end
        end

        describe "#project" do
          context "when passed a Table" do
            it "returns a TableProjection with self as #operand and the given Table as its #projected_table" do
              join = Blog.table.join(BlogPost.table).on(BlogPost[:blog_id].eq(Blog[:id]))
              projection = join.project(BlogPost.table)
              projection.class.should == TableProjection
              projection.operand.should == join
              projection.projected_table.should == BlogPost.table
            end
          end

          context "when passed a subclass of Record" do
            it "returns a TableProjection with self as #operand and the #table of the given Record subclass as its #projected_table" do
              join = Blog.table.join(BlogPost.table).on(BlogPost[:blog_id].eq(Blog[:id]))
              projection = join.project(BlogPost)
              projection.class.should == TableProjection
              projection.operand.should == join
              projection.projected_table.should == BlogPost.table
            end
          end
        end

        describe "#find" do
          context "when passed an id" do
            it "returns the first Record in a Selection where id is equal to the given id" do
              BlogPost.table.find("grain_quinoa").should == BlogPost.table.where(BlogPost[:id].eq("grain_quinoa")).records.first
            end
          end

          context "when passed a Predicate" do
            it "returns the first Record in the Relation that matches the Predicate" do
              BlogPost.table.find(BlogPost[:body].eq("Millet")).should == BlogPost.where(BlogPost[:body].eq("Millet")).records.first
            end
          end
        end


        describe "#record_wire_representations" do
          it "returns the #wire_representation of all its #records" do
            BlogPost.table.record_wire_representations.should == BlogPost.table.records.map {|t| t.wire_representation}
          end
        end

        describe "#each" do
          specify "delegates to #records of #table" do
            records = []
            stub(BlogPost.table).records { records }

            block = lambda {}
            mock(records).each(&block)
            BlogPost.table.each(&block)
          end
        end
      end
    end
  end
end

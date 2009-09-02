require File.expand_path("#{File.dirname(__FILE__)}/../../../eden_spec_helper")

=begin
module Model
  module Relations
    describe SetProjection do
      attr_reader :join, :projection, :composite_join, :composite_projection
      before do
        @join = Blog.where(Blog.id.eq("grain")).join(BlogPost).on(Blog.id.eq(BlogPost[:blog_id]))
        @projection = SetProjection.new(join, Blog.set)

        @composite_join = projection.join(BlogPost.set).on(BlogPost[:blog_id].eq(Blog.id))
        @composite_projection = SetProjection.new(composite_join, BlogPost.set)
      end

      describe "class methods" do
        describe ".from_wire_representation" do
          it "builds a SetProjection with its #operand resolved in the given subdomain and the set associated with the tuple class of the relation named as 'projected_set' as its #projected_set" do
            subdomain = Group.find("dating")
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

            projection = SetProjection.from_wire_representation(representation, subdomain)
            projection.class.should == SetProjection
            projection.projected_set.should == BlogPost.set
            projection.operand.class.should == InnerJoin
          end
        end
      end

      describe "instance methods" do
        describe "#tuples" do
          it "executes an appropriate SQL query against the database and returns Tuples corresponding to its results" do
            tuples = projection.tuples
            tuples.should_not be_empty
            tuples.each do |tuple|
              tuple.class.should == Blog
            end
          end
        end

        describe "#to_sql" do
          context "when the composed relation contains only one SetProjection" do
            it "generates a query that selects the columns of #projected_set and includes all joined tables in its from clause" do
              projected_columns = projection.projected_set.columns.map {|a| a.to_sql}.join(", ")
              projection.to_sql.should == %{select #{projected_columns} from question_sets, questions where questions.question_set_id = question_sets.id and question_sets.id = "foods";}
            end
          end

          context "when the composed relation contains more than one SetProjection" do
            it "generates a query that selects the columns of #projected_set and includes all joined tables in its from clause" do
              projected_columns = composite_projection.projected_set.columns.map {|a| a.to_sql}.join(", ")
              composite_projection.to_sql.should == %{select #{projected_columns} from blogs, blog_posts where blog_posts.blog_id = questions.id and questions.question_set_id = question_sets.id and question_sets.id = "foods";}
            end
          end
        end
      end
    end
  end
=end

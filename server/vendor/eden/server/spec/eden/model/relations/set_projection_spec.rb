require File.expand_path("#{File.dirname(__FILE__)}/../../../eden_spec_helper")

=begin
module Model
  module Relations
    describe TableProjection do
      attr_reader :join, :projection, :composite_join, :composite_projection
      before do
        @join = Blog.where(Blog.id.eq("grain")).join(BlogPost).on(Blog.id.eq(BlogPost[:blog_id]))
        @projection = TableProjection.new(join, Blog.table)

        @composite_join = projection.join(BlogPost.table).on(BlogPost[:blog_id].eq(Blog.id))
        @composite_projection = TableProjection.new(composite_join, BlogPost.table)
      end

      describe "class methods" do
        describe ".from_wire_representation" do
          it "builds a TableProjection with its #operand resolved in the given subdomain and the table associated with the record class of the relation named as 'projected_table' as its #projected_table" do
            subdomain = Group.find("dating")
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

            projection = TableProjection.from_wire_representation(representation, subdomain)
            projection.class.should == TableProjection
            projection.projected_table.should == BlogPost.table
            projection.operand.class.should == InnerJoin
          end
        end
      end

      describe "instance methods" do
        describe "#records" do
          it "executes an appropriate SQL query against the database and returns Records corresponding to its results" do
            records = projection.records
            records.should_not be_empty
            records.each do |record|
              record.class.should == Blog
            end
          end
        end

        describe "#to_sql" do
          context "when the composed relation contains only one TableProjection" do
            it "generates a query that selects the columns of #projected_table and includes all joined tables in its from clause" do
              projected_columns = projection.projected_table.columns.map {|a| a.to_sql}.join(", ")
              projection.to_sql.should == %{select #{projected_columns} from question_tables, questions where questions.question_table_id = question_tables.id and question_tables.id = "foods";}
            end
          end

          context "when the composed relation contains more than one TableProjection" do
            it "generates a query that selects the columns of #projected_table and includes all joined tables in its from clause" do
              projected_columns = composite_projection.projected_table.columns.map {|a| a.to_sql}.join(", ")
              composite_projection.to_sql.should == %{select #{projected_columns} from blogs, blog_posts where blog_posts.blog_id = questions.id and questions.question_table_id = question_tables.id and question_tables.id = "foods";}
            end
          end
        end
      end
    end
  end
=end

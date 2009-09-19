require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Selection do
      describe "class methods" do
        describe ".from_wire_representation" do
          it "builds a Selection with an #operand resolved in the given repository" do
            repository = User.find("jan")
            selection = Selection.from_wire_representation({
              "type" => "selection",
              "operand" => {
                "type" => "table",
                "name" => "blog_posts"
              },
              "predicate" => {
                "type" => "eq",
                "left_operand" => {
                  "type" => "column",
                  "table" => "blog_posts",
                  "name" => "blog_id"
                },
                "right_operand" => {
                  "type" => "scalar",
                  "value" => "grain"
                }
              }
            }, repository)

            selection.class.should == Relations::Selection
            selection.operand.should == repository.blog_posts
            selection.predicate.class.should == Predicates::Eq
            selection.predicate.left_operand.should == BlogPost[:blog_id]
            selection.predicate.right_operand.should == "grain"
          end
        end
      end

      describe "instance methods" do
        attr_reader :operand, :predicate, :selection, :predicate_2, :composite_selection
        before do
          @operand = BlogPost.table
          @predicate = Predicates::Eq.new(BlogPost[:blog_id], "grain")
          @selection = Selection.new(operand, predicate)
          @predicate_2 = Predicates::Eq.new(BlogPost[:body], "Barley")
          @composite_selection = Selection.new(selection, predicate_2)
        end

        describe "#records" do
          context "when #operand is a Table" do
            it "executes an appropriate SQL query against the database and returns Records corresponding to its results" do
              BlogPost.table.records.detect {|t| t.blog_id == "grain"}.should_not be_nil
              records = selection.records
              records.should_not be_empty
              records.each do |record|
                record.blog_id.should == "grain"
              end
            end
          end

          context "when #operand is a Selection" do
            it "executes an appropriate SQL query against the database and returns Records corresponding to its results" do
              record = composite_selection.records.first
              record.should_not be_nil
              record.blog_id.should == "grain"
              record.body.should == "Barley"
            end
          end
        end

        describe "#to_sql" do
          context "when #operand is a Table" do
            it "generates a query with an appropriate where clause" do
              selection.to_sql.should == "select #{operand.columns.map {|a| a.to_sql}.join(", ")} from #{operand.global_name} where #{predicate.to_sql};"
            end
          end

          context "when #operand is another Selection" do
            it "generates a query with a where clause that has multiple conditions" do
              composite_selection.to_sql.should == "select #{operand.columns.map {|a| a.to_sql}.join(", ")} from #{operand.global_name} where #{predicate_2.to_sql} and #{predicate.to_sql};"
            end
          end
        end
      end
    end
  end
end

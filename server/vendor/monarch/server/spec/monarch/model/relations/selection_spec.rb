require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Selection do
      describe "class methods" do
        describe ".from_wire_representation" do
          it "builds a Selection with an #operand resolved in the given repository" do
            repository = UserRepository.new(User.find("jan"))
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
            selection.operand.should == repository.resolve_table_name(:blog_posts)
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

        describe "#all" do
          context "when #operand is a Table" do
            it "executes an appropriate SQL query against the database and returns Records corresponding to its results" do
              BlogPost.table.all.detect {|t| t.blog_id == "grain"}.should_not be_nil
              all = selection.all
              all.should_not be_empty
              all.each do |record|
                record.blog_id.should == "grain"
              end
            end
          end

          context "when #operand is a Selection" do
            it "executes an appropriate SQL query against the database and returns Records corresponding to its results" do
              record = composite_selection.all.first
              record.should_not be_nil
              record.blog_id.should == "grain"
              record.body.should == "Barley"
            end
          end
        end

        describe "#create(field_values)" do
          it "introduces an additional field value to match its predicate if needed" do
            mock(operand).create(:blog_id => "grain", :body => "Barley", :title => "Barely Barley")
            composite_selection.create(:title => "Barely Barley")
          end
        end

        describe "#to_sql" do
          context "when #operand is a Table" do
            it "generates a query with an appropriate where clause" do
              selection.to_sql.should == "select * from #{operand.global_name} where #{predicate.to_sql}"
            end
          end

          context "when #operand is another Selection" do
            it "generates a query with a where clause that has multiple conditions" do
              composite_selection.to_sql.should == "select * from #{operand.global_name} where #{predicate_2.to_sql} and #{predicate.to_sql}"
            end
          end
        end

        describe "#==" do
          it "structurally compares the receiver with the operand" do
            predicate_2 = Predicates::Eq.new(BlogPost[:blog_id], "grain")
            selection_2 = Selection.new(operand, predicate_2)

            selection.should == selection_2
          end
        end

      end
    end
  end
end

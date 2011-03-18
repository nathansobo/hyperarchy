require 'spec_helper'

module Prequel
  module Relations
    describe Selection do
      before do
        class Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :title, :integer
        end
      end

      describe "#initialize" do
        it "resolves symbols in the selection's predicate to columns derived from the selection's operand, not the selection itself" do
          selection = Blog.where(:user_id => 1)
          selection.predicate.left.should == Blog.table.get_column(:user_id)
        end
      end

      describe "#to_sql" do
        describe "a selection on a table" do
          it "generates the appropriate SQL" do
            Blog.where(:user_id => 1).to_sql.should be_like_query(%{
              select * from blogs where blogs.user_id = :v1
            }, :v1 => 1)
          end
        end
      end

      describe "#to_update_sql(attributes)" do
        it "generates the appropriate SQL" do
          Blog.where(:user_id => 1).to_update_sql(:title => "New Title").should be_like_query(%{
            update blogs set title = :v2 where blogs.user_id = :v1
          }, :v1 => 1, :v2 => "New Title")
        end
      end

      describe "#==" do
        before do
          class Blog2 < Prequel::Record
            column :id, :integer
            column :user_id, :integer
          end
        end

        it "performs a semantic comparison based on predicate and argument" do
          Blog.where(:user_id => 1).should == Blog.where(:user_id => 1)
          Blog.where(:user_id => 1).should_not == Blog.where(:user_id => 2)
          Blog2.where(:user_id => 1).should_not == Blog.where(:user_id => 1)
        end
      end

      describe "#wire_representation" do
        it "returns a JSON representation that can be evaluated in a sandbox" do
          Blog.where(:user_id => 1).wire_representation.should == {
            "type" => "selection",
            "operand" => {
              "type" => "table",
              "name" => "blogs"
            },
            "predicate" => {
              "type" => "eq",
              "left_operand" => {
                "type" => "column",
                "table" => "blogs",
                "name" => "user_id"
              },
              "right_operand" => {
                "type" => "scalar",
                "value" => 1
              }
            }
          }
        end
      end
    end
  end
end

require 'spec_helper'

module Prequel
  module Relations
    describe Selection do
      before do
        class ::Blog < Prequel::Record
          column :id, :integer
          column :user_id, :integer
          column :title, :string
        end

        class ::User < Prequel::Record
          column :id, :integer
        end
      end

      describe "#initialize" do
        it "resolves symbols in the selection's predicate to columns derived from the selection's operand, not the selection itself" do
          selection = Blog.where(:user_id => 1)
          selection.predicate.left.should == Blog.table.get_column(:user_id)
        end

        it "translates record equality to foreign key equality" do
          User.create_table
          DB[:users] << { :id => 1 }
          selection = Blog.where(:user => User.find(1))
          selection.predicate.left.should == Blog.table.get_column(:user_id)
          selection.predicate.right.should == 1

          selection = Blog.where(:user => nil)
          selection.predicate.left.should == Blog.table.get_column(:user_id)
          selection.predicate.right.should == nil
        end
      end

      describe "#new(attributes)" do
        it "instantiates an unsaved record with attributes that match the predicate" do
          blog = Blog.where(:user_id => 1).new(:title => "User 1's Blog")
          blog.id.should be_nil
          blog.user_id.should == 1
        end
      end

      describe "#create, #create!, and #find_or_create" do
        before do
          Blog.create_table
        end

        describe "#create(attributes)" do
          it "creates a record with attributes that match the predicate" do
            blog = Blog.where(:user_id => 1).create(:title => "User 1's Blog")
            blog.user_id.should == 1
          end
        end

        describe "#create!(attributes)" do
          it "when the record is not valid, raises a Record::NotValid exception" do
            class ::Blog
              def valid?
                false
              end
            end

            expect {
              blog = Blog.where(:user_id => 1).create!(:title => "User 1's Blog")
            }.to raise_error(Record::NotValid)
          end

          it "if the record is valid, creates a it as normal" do
            blog = Blog.where(:user_id => 1).create!(:title => "User 1's Blog")
            blog.user_id.should == 1
          end
        end

        describe "#find_or_create(attributes)" do
          describe "when a record matching the criteria exists" do
            it "returns the matching record" do
              DB[:blogs] << { :id => 1, :user_id => 1, :title => "My Blog"}
              Blog.where(:user_id => 1).find_or_create(:title => "My Blog").should == Blog.find(1)
            end
          end

          describe "when no record matching the criteria exists" do
            it "creates and returns a new record that matches" do
              expect {
                blog = Blog.where(:user_id => 1).find_or_create(:title => "My Blog")
                blog.id.should_not be_nil
                blog.user_id.should == 1
                blog.title.should == "My Blog"
              }.should change(Blog, :count).by(1)
            end
          end
        end

        describe "#find_or_create!(attributes)" do
          context "when there are validation errors" do
            before do
              class ::Blog
                def valid?
                  false
                end
              end
            end

            it "raises an exception" do
              expect {
                Blog.where(:user_id => 1).find_or_create!(:title => "My Blog")
              }.to raise_error(Record::NotValid)
            end
          end

          context "when there are no validation errors" do
            it "works as normal" do
              expect {
                blog = Blog.where(:user_id => 1).find_or_create!(:title => "My Blog")
                blog.id.should_not be_nil
                blog.user_id.should == 1
                blog.title.should == "My Blog"
              }.should change(Blog, :count).by(1)
            end
          end
        end
      end

      describe "#to_sql" do
        describe "a selection on a table" do
          it "generates the appropriate SQL" do
            Blog.where(:user_id => 1).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id = :v1
            }, :v1 => 1)
          end
        end

        describe "with an equal predicate involving nil" do
          it "generates 'is' instead of '='" do
            Blog.where(:user_id => nil).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id is null
            })
          end
        end

        describe "with a not-equal predicate" do
          it "generates the appropriate sql" do
            Blog.where(:user_id.neq(1)).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id != :v1
            }, :v1 => 1)
          end
        end

        describe "with a not-equal predicate involving nil" do
          it "generates 'is not' instead of '!='" do
            Blog.where(:user_id.neq(nil)).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id is not null
            })
          end
        end

        describe "with a less-than predicate" do
          it "generates the appropriate sql" do
            Blog.where(:user_id.lt(2)).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id < :v1
            }, :v1 => 2)
          end
        end

        describe "with a less-than-or-equal predicate" do
          it "generates the appropriate sql" do
            Blog.where(:user_id.lte(2)).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id <= :v1
            }, :v1 => 2)
          end
        end

        describe "with a greater-than predicate" do
          it "generates the appropriate sql" do
            Blog.where(:user_id.gt(2)).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id > :v1
            }, :v1 => 2)
          end
        end

        describe "with a greater-than-or-equal predicate" do
          it "generates the appropriate sql" do
            Blog.where(:user_id.gte(2)).to_sql.should be_like_query(%{
              select blogs.id,
                     blogs.user_id,
                     blogs.title
              from   blogs
              where  blogs.user_id >= :v1
            }, :v1 => 2)
          end
        end


        describe "with an or predicate" do
          it "generates the appropriate sql" do
            Blog.where(:user_id.eq(2) | :user_id.eq(3)).to_sql.should be_like_query(%{
              select blogs.id, blogs.user_id, blogs.title from blogs where (blogs.user_id = :v1 or blogs.user_id = :v2)
            }, :v1 => 2, :v2 => 3)
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

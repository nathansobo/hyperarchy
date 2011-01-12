require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Relations
      describe TableProjection do
        attr_reader :projection, :composite_join, :composite_projection
        def operand
          @operand ||= Blog.where(Blog[:id].eq("grain")).join(BlogPost).on(Blog[:id].eq(BlogPost[:blog_id]))
        end

        before do
          @projection = TableProjection.new(operand, Blog.table)
          @composite_join = projection.join(BlogPost.table).on(BlogPost[:blog_id].eq(Blog[:id]))
          @composite_projection = TableProjection.new(composite_join, BlogPost.table)
        end

        describe "class methods" do
          describe ".from_wire_representation" do
            it "builds a TableProjection with its #operand resolved in the given repository and the table associated with the record class of the relation named as 'projected_table' as its #projected_table" do
              repository = UserRepository.new(User.find("jan"))
              representation = {
                "type" => "table_projection",
                "projected_table" => "blog_posts",
                "operand" => {
                  "type" => "inner_join",
                  "left_operand" => {
                    "type" => "table",
                    "name" => "blogs"
                  },
                  "right_operand" => {
                    "type" => "table",
                    "name" => "blog_posts"
                  },
                  "predicate" => {
                    "type" => "eq",
                    "left_operand" => {
                      "type" => "column",
                      "table" => "blogs",
                      "name" => "id"
                    },
                    "right_operand" => {
                      "type" => "column",
                      "table" => "blog_posts",
                      "name" => "blog_id"
                    }
                  }
                }
              }

              projection = TableProjection.from_wire_representation(representation, repository)
              projection.to_sql.should be_like_query(%{
                select blog_posts.*
                from blogs, blog_posts
                where blogs.id = blog_posts.blog_id and blogs.user_id = :v1
              }, :v1 => "jan".to_key)
            end
          end
        end

        describe "#all" do
          it "executes an appropriate SQL query against the database and returns Records corresponding to its results" do
            all = projection.all
            all.should_not be_empty
            all.each do |record|
              record.class.should == Blog
            end
          end
        end

        describe "#==" do
          it "structurally compares the receiver with the operand" do
            join_2 = Blog.where(Blog[:id].eq("grain")).join(BlogPost).on(Blog[:id].eq(BlogPost[:blog_id]))
            projection_2 = TableProjection.new(join_2, Blog.table)

            projection.should == projection_2
          end
        end

        describe "event handling" do
          def operand
            @operand ||= Blog.join_to(BlogPost)
          end

          describe "propagation of operand events" do
            attr_reader :on_insert_calls, :on_update_calls, :on_remove_calls, :on_insert_subscription, :on_update_subscription, :on_remove_subscription

            before do
              @on_insert_calls = []
              @on_update_calls = []
              @on_remove_calls = []

              @on_insert_subscription = projection.on_insert do |record|
                on_insert_calls.push(record)
              end
              @on_update_subscription = projection.on_update do |record, changeset|
                on_update_calls.push([record, changeset])
              end
              @on_remove_subscription = projection.on_remove do |record|
                on_remove_calls.push(record)
              end
            end

            after do
              on_insert_subscription.destroy
              on_update_subscription.destroy
              on_remove_subscription.destroy
            end

            describe "when a tuple is inserted in the operand" do
              it "triggers #on_insert callbacks with the record corresponding to the projected table if that record was not previously present in the projection" do
                blog = Blog.unsafe_create(:id => "polygons")
                blog.blog_posts.create!(:body => "triangle")

                on_insert_calls.length.should == 1
                on_insert_calls.first.should == blog

                blog.blog_posts.create!(:body => "square")
                on_insert_calls.length.should == 1

                on_update_calls.should be_empty
                on_remove_calls.should be_empty
              end
            end

            describe "when a tuple is updated in the operand" do
              it "triggers #on_update events with a projected changeset only if the update touched columns in the projected table" do
                blog = Blog.find('grain')
                post = blog.blog_posts.first

                post.update(:body => "Rustic raver")
                on_update_calls.should be_empty

                title_before = blog.title
                blog.update(:title => "Beep street")

                on_update_calls.length.should == 1
                on_update_calls.first[0].should == blog

                changeset = on_update_calls.first[1]
                changeset.old_state.title.should == title_before
                changeset.new_state.title.should == "Beep street"

                blog.update(:title => "Hash rocket")

                on_update_calls.length.should == 2
                changeset_2 = on_update_calls[1][1]
                changeset_2.old_state.title.should == "Beep street"
                changeset_2.new_state.title.should == "Hash rocket"

                on_insert_calls.should be_empty
                on_remove_calls.should be_empty
              end
            end

            describe "when a tuple is removed from the operand" do
              it "triggers #on_remove callbacks with the record corresponding to the projected table if there are no more instances of that record in the projection" do
                blog = Blog.find('grain')
                blog.blog_posts.each do |post|
                  post.destroy
                end

                on_insert_calls.should be_empty
                on_update_calls.should be_empty

                on_remove_calls.length.should == 1
                on_remove_calls.should == [blog]
              end
            end
          end

          describe "subscription lifecycle" do
            it "subscribes to its operand the first time a subscription is made on the projection and unsubscribes once the last subscription is destroyed" do
              subscription_1, subscription_2 = nil

              lambda do
                subscription_1 = projection.on_insert {|x| }
              end.should change {projection.operand.num_subscriptions}.by(3)

              lambda do
                subscription_2 = projection.on_insert { }
              end.should_not change {projection.operand.num_subscriptions}

              lambda do
                subscription_1.destroy
              end.should_not change {projection.operand.num_subscriptions}

              lambda do
                subscription_2.destroy
              end.should change {projection.operand.num_subscriptions}.by(-3)
            end
          end
        end
      end
    end
  end
end

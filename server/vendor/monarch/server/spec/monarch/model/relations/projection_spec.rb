require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Projection do
      attr_reader :projection, :operand, :projected_columns

      before do
        @operand = Blog.join(BlogPost).on(BlogPost[:blog_id].eq(Blog[:id]))
        @projected_columns = [
          BlogPost[:id],
          Blog[:title].as(:blog_title),
          BlogPost[:title].as(:blog_post_title),
          Blog[:user_id],
          BlogPost[:body]
        ]
        @projection = Projection.new(operand, projected_columns) do
          def foo; end
        end
      end

      describe "#initialize" do
        it "if a block is provided, class_evals it in the Projection singleton class" do
          projection.should respond_to(:foo)
        end
      end

      describe "#all" do
        it "returns instances of ProjectionRecord that have reader methods for each column in the projection" do
          operand_records = operand.all
          operand_records.should_not be_empty
          all = projection.all
          all.size.should == operand_records.size

          operand_records.each_with_index do |join_record, index|
            blog = join_record[Blog]
            blog_post = join_record[BlogPost]

            projected_tuple = all[index]

            projected_tuple.blog_post_title.should == blog_post.title
            projected_tuple.blog_title.should == blog.title
            projected_tuple.body.should == blog_post.body
            projected_tuple.user_id.should == blog.user_id
            projected_tuple.should be_valid
          end
        end
      end

      describe "#find(id)" do
        it "finds the ProjectionRecord with the given id" do
          operand_record = operand.first
          blog = operand_record[Blog]
          blog_post = operand_record[BlogPost]
          projected_tuple = projection.find(blog_post.id)

          projected_tuple.blog_post_title.should == blog_post.title
          projected_tuple.blog_title.should == blog.title
          projected_tuple.user_id.should == blog.user_id
          projected_tuple.body.should == blog_post.body
        end
      end

      describe "#to_sql" do
        it "generates appropriate sql" do
          projection.to_sql.should == %{
            select distinct
              blog_posts.id as id,
              blogs.title as blog_title,
              blog_posts.title as blog_post_title,
              blogs.user_id as user_id,
              blog_posts.body as body
            from
              blogs,
              blog_posts
            where
              blog_posts.blog_id = blogs.id
          }.gsub(/[  \n]+/, " ").strip
        end

        it "always honors the topmost projection operation in the relation tree" do
          composed_projection = projection.project(BlogPost[:id], Blog[:title].as(:blog_title))
          projection.to_sql.should == %{select distinct blog_posts.id as id, blogs.title as blog_title, blog_posts.title as blog_post_title, blogs.user_id as user_id, blog_posts.body as body from blogs, blog_posts where blog_posts.blog_id = blogs.id}
        end
      end

      describe "#==" do
        it "structurally compares the receiver with the operand" do
          operand_2 = Blog.join(BlogPost).on(BlogPost[:blog_id].eq(Blog[:id]))
          projected_columns_2 = [
            BlogPost[:id],
            Blog[:title].as(:blog_title),
            BlogPost[:title].as(:blog_post_title),
            Blog[:user_id],
            BlogPost[:body]
          ]
          projection_2 = Projection.new(operand_2, projected_columns_2)

          projection.should == projection_2
        end
      end

      describe "event handling" do
        describe "propagation of operand events" do
          attr_reader :on_insert_calls, :on_update_calls, :on_remove_calls, :on_insert_subscription, :on_update_subscription,
                      :on_remove_subscription, :blog, :post
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

            @blog = Blog.find('grain')
            @post = blog.blog_posts.first
          end

          after do
            on_insert_subscription.destroy
            on_update_subscription.destroy
            on_remove_subscription.destroy
          end

          describe "when a tuple is inserted into the operand" do
            it "triggers on_insert events with the projection of the tuple" do
              blog = Blog.find('grain')
              post = blog.blog_posts.create(:title => "Cornflakes", :body => "These aren't actually very good for breakfast")

              on_insert_calls.length.should == 1
              tuple = on_insert_calls.first
              tuple.id.should == post.id
              tuple.blog_title.should == blog.title
              tuple.blog_post_title.should == post.title
              tuple.user_id.should == blog.user_id
              tuple.body.should == post.body

              on_update_calls.should be_empty
              on_remove_calls.should be_empty
            end
          end

          describe "when a record is updated in the operand" do
            context "if one of the updated columns is in the projection" do
              it "triggers update callbacks with the projection of the tuple" do
                post.title = "Moo Moo Bahh"
                post.save

                on_insert_calls.should be_empty

                on_update_calls.length.should == 1
                on_update_tuple, on_update_changeset = on_update_calls.first

                on_update_tuple.id.should == post.id
                on_update_tuple.blog_title.should == blog.title
                on_update_tuple.blog_post_title.should == post.title
                on_update_tuple.user_id.should == blog.user_id
                on_update_tuple.body.should == post.body
                on_update_changeset.wire_representation.should == {"blog_post_title" => "Moo Moo Bahh"} 

                on_remove_calls.should be_empty
              end
            end

            context "if none of the updated columns are in the projection" do
              it "does not trigger any callbacks" do
                post.created_at = Time.now
                post.save

                on_insert_calls.should be_empty
                on_update_calls.should be_empty
                on_remove_calls.should be_empty
              end
            end
          end

          describe "when a record is removed from the operand" do
            it "triggers on_remove events with the projection of the deleted tuple" do
              post = BlogPost.find('grain_quinoa')
              blog = post.blog
              post.destroy

              on_insert_calls.should be_empty
              on_update_calls.should be_empty
              on_remove_calls.length.should == 1

              tuple = on_remove_calls.first
              tuple.id.should == post.id
              tuple.blog_title.should == blog.title
              tuple.blog_post_title.should == post.title
              tuple.user_id.should == blog.user_id
              tuple.body.should == post.body
            end
          end
        end

        describe "subscription lifecycle" do
          it "subscribes to its operand the first time a subscription is made on the selection and unsubscribes once the last subscription is destroyed" do
            subscription_1, subscription_2 = nil

            lambda do
              subscription_1 = projection.on_insert { }
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

require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Union do
      attr_reader :operand_1, :operand_2, :union

      before do
        @operand_1 = BlogPost.where(BlogPost[:blog_id].eq("grain"))
        @operand_2 = BlogPost.where(BlogPost[:blog_id].eq("vegetable"))
        @union = Union.new([operand_1, operand_2])
      end

      describe "#all" do
        it "returns the results of executing the union query" do
          Set.new(union.all).should == Set.new(operand_1.all | operand_2.all)
        end
      end

      describe "#to_sql" do
        it "generates the union of sql queries corresponding to the operands" do
          union.to_sql.should == "#{operand_1.to_sql} union #{operand_2.to_sql}"
        end

        context "if the union is nested within a larger query" do
          it "pushes the operations that are above the union in the relation tree into the union's subqueries for performance" do
            Blog.join_to(union).where(Blog[:user_id].eq("jan")).project(BlogPost).to_sql.should == %{
              select distinct
                blog_posts.id as id,
                blog_posts.title as title,
                blog_posts.body as body,
                blog_posts.blog_id as blog_id,
                blog_posts.created_at as created_at,
                blog_posts.featured as featured
              from
                blogs, blog_posts
              where
                blogs.user_id = #{"jan".hash}
                and blogs.id = blog_posts.blog_id
                and blog_posts.blog_id = #{"grain".hash}
              union
              select distinct
                blog_posts.id as id,
                blog_posts.title as title,
                blog_posts.body as body,
                blog_posts.blog_id as blog_id,
                blog_posts.created_at as created_at,
                blog_posts.featured as featured
              from
                blogs, blog_posts
              where
                blogs.user_id = #{"jan".hash}
                and blogs.id = blog_posts.blog_id
                and blog_posts.blog_id = #{"vegetable".hash}
            }.gsub(/\s+/, " ").strip
          end
        end
      end

      describe "event handling" do
        describe "propagation of operand events" do
          attr_reader :on_insert_calls, :on_update_calls, :on_remove_calls, :on_insert_subscription, :on_update_subscription, :on_remove_subscription

          before do
            @on_insert_calls = []
            @on_update_calls = []
            @on_remove_calls = []

            @on_insert_subscription = union.on_insert do |record|
              on_insert_calls.push(record)
            end
            @on_update_subscription = union.on_update do |record, changeset|
              on_update_calls.push([record, changeset])
            end
            @on_remove_subscription = union.on_remove do |record|
              on_remove_calls.push(record)
            end
          end

          after do
            on_insert_subscription.destroy
            on_update_subscription.destroy
            on_remove_subscription.destroy
          end

          describe "when a tuple is inserted into an operand" do
            it "triggers #on_insert events" do
              grain_post = BlogPost.create(:blog_id => "grain", :title => "Hash rocket")
              on_insert_calls.should == [grain_post]

              vegetable_post = BlogPost.create(:blog_id => "vegetable", :title => "Hash rocket")
              on_insert_calls.should == [grain_post, vegetable_post]

              on_update_calls.should be_empty
              on_remove_calls.should be_empty
            end
          end

          describe "when a tuple is removed from an operand" do
            it "triggers #on_remove events" do
              post_1 = operand_1.first
              post_1.destroy
              on_remove_calls.should == [post_1]

              post_2 = operand_2.first
              post_2.destroy
              on_remove_calls.should == [post_1, post_2]

              on_insert_calls.should be_empty
              on_update_calls.should be_empty
            end
          end

          describe "when a tuple in one of the operands is updated" do
            it "triggers #on_update events" do
              post = operand_1.first
              post.title = "Hash rocket"
              post.save

              on_insert_calls.should be_empty
              on_update_calls.length.should == 1
              tuple, changeset = on_update_calls.first
              tuple.should == post
              changeset.wire_representation.should == {"title" => "Hash rocket"}

              on_remove_calls.should be_empty
            end
          end
        end
      end
    end
  end
end

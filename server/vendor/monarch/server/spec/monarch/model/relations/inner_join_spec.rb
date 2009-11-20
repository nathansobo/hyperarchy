require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe InnerJoin do

      describe "class methods" do
        describe ".from_wire_representation" do
          it "builds an InnerJoin with its operands resolved in the given repository" do
            repository = UserRepository.new(User.find("jan"))
            representation = {
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

            join = InnerJoin.from_wire_representation(representation, repository)
            join.class.should == InnerJoin
            join.left_operand.should == repository.resolve_table_name(:blogs)
            join.right_operand.should == repository.resolve_table_name(:blog_posts)
            join.predicate.left_operand.should == Blog[:id]
            join.predicate.right_operand.should == BlogPost[:blog_id]
          end
        end
      end

      describe "instance methods" do
        attr_reader :left_operand, :right_operand, :predicate, :join
        before do
          @left_operand = Blog.table
          @right_operand = BlogPost.table
          @predicate = Blog[:id].eq(BlogPost[:blog_id])
          @join = InnerJoin.new(left_operand, right_operand, predicate)
        end

        describe "#all" do
          it "instantiates a CompositeTuple for each of the all returned by the join" do
            composite_records = join.all
            composite_records.size.should == BlogPost.all.size

            composite_records.each do |composite_record|
              blog = composite_record[Blog]
              post = composite_record[BlogPost]
              post.blog.should == blog
            end
          end
        end

        describe "#to_sql" do
          it "generates a query" do
            join.to_sql.should == %{
              select distinct
                blogs.id as blogs__id,
                blogs.title as blogs__title,
                blogs.user_id as blogs__user_id,
                blog_posts.id as blog_posts__id,
                blog_posts.title as blog_posts__title,
                blog_posts.body as blog_posts__body,
                blog_posts.blog_id as blog_posts__blog_id,
                blog_posts.created_at as blog_posts__created_at
              from
                blogs, blog_posts
              where
                blogs.id = blog_posts.blog_id
            }.gsub(/[ \n]+/, " ").strip
          end
        end

        describe "#==" do
          it "structurally compares the receiver with the operand" do
            predicate_2 = Blog[:id].eq(BlogPost[:blog_id])
            join_2 = InnerJoin.new(left_operand, right_operand, predicate_2)
            join.should == join_2
          end
        end
      end
    end
  end
end

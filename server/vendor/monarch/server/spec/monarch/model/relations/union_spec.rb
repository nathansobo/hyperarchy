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
                blogs.user_id = \"jan\"
                and blogs.id = blog_posts.blog_id
                and blog_posts.blog_id = \"grain\"
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
                blogs.user_id = \"jan\"
                and blogs.id = blog_posts.blog_id
                and blog_posts.blog_id = \"vegetable\"
            }.gsub(/\s+/, " ").strip
          end
        end
      end
    end
  end
end

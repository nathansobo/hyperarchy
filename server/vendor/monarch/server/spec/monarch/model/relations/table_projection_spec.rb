require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe TableProjection do
      attr_reader :join, :projection, :composite_join, :composite_projection
      before do
        @join = Blog.where(Blog[:id].eq("grain")).join(BlogPost).on(Blog[:id].eq(BlogPost[:blog_id]))
        @projection = TableProjection.new(join, Blog.table)

        @composite_join = projection.join(BlogPost.table).on(BlogPost[:blog_id].eq(Blog[:id]))
        @composite_projection = TableProjection.new(composite_join, BlogPost.table)
      end

      describe "class methods" do
        describe ".from_wire_representation" do
          it "builds a TableProjection with its #operand resolved in the given repository and the table associated with the record class of the relation named as 'projected_table' as its #projected_table" do
            repository = UserRepository.new(User.find('jan'))
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
            projection.to_sql.should == %{
              select distinct
                blog_posts.id as id,
                blog_posts.title as title,
                blog_posts.body as body,
                blog_posts.blog_id as blog_id,
                blog_posts.created_at as created_at,
                blog_posts.featured as featured
              from
                blogs,
                blog_posts
              where
                blogs.id = blog_posts.blog_id
                and blogs.user_id = "jan"
            }.gsub(/[ \n]+/, " ").strip
          end
        end
      end

      describe "instance methods" do
        describe "#all" do
          it "executes an appropriate SQL query against the database and returns Records corresponding to its results" do
            all = projection.all
            all.should_not be_empty
            all.each do |record|
              record.class.should == Blog
            end
          end
        end

        describe "#to_sql" do
          context "when the composed relation contains only one TableProjection" do
            it "generates a query that selects the columns of #projected_table and includes all joined tables in its from clause" do
              projection.to_sql.should == %{select distinct blogs.id as id, blogs.title as title, blogs.user_id as user_id from blogs, blog_posts where blogs.id = blog_posts.blog_id and blogs.id = "grain"}
            end
          end

          context "when the composed relation contains more than one TableProjection" do
            it "generates a query that selects the columns of #projected_table and includes all joined tables in its from clause" do
              composite_projection.to_sql.should == %{
                select distinct
                  blog_posts.id as id,
                  blog_posts.title as title,
                  blog_posts.body as body,
                  blog_posts.blog_id as blog_id,
                  blog_posts.created_at as created_at,
                  blog_posts.featured as featured
                from
                  blogs,
                  blog_posts
                where
                  blog_posts.blog_id = blogs.id
                  and blogs.id = "grain"
              }.gsub(/[ \n]+/, " ").strip
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
      end
    end
  end
end

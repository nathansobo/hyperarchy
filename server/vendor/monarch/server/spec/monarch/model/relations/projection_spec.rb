require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe Projection do
      attr_reader :projection, :operand, :projected_columns

      before do
        @operand = Blog.join(BlogPost).on(BlogPost[:blog_id].eq(Blog[:id]))
        @projected_columns = [
          Blog[:title].as(:blog_title),
          BlogPost[:title].as(:blog_post_title),
          ProjectedColumn.new(Blog[:user_id]),
          ProjectedColumn.new(BlogPost[:body])
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

      describe "#records" do
        it "returns instances of ProjectionRecord that have reader methods for each column in the projection" do
          operand_records = operand.records
          operand_records.should_not be_empty
          records = projection.records
          records.size.should == operand_records.size

          operand_records.each_with_index do |join_record, index|
            blog = join_record[Blog]
            blog_post = join_record[BlogPost]

            projection_record = records[index]

            projection_record.blog_post_title.should == blog_post.title
            projection_record.blog_title.should == blog.title
            projection_record.body.should == blog_post.body
            projection_record.user_id.should == blog.user_id
          end
        end
      end

      describe "#to_sql" do
        it "generates appropriate sql" do
          projection.to_sql.should == %{
            select distinct
              blogs.title as blog_title,
              blog_posts.title as blog_post_title,
              blogs.user_id,
              blog_posts.body
            from
              blogs,
              blog_posts
            where
              blog_posts.blog_id = blogs.id
          }.gsub(/[  \n]+/, " ").strip
        end
      end
    end
  end
end

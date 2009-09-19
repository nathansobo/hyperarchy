require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Relations
    describe InnerJoin do
      describe ".from_wire_representation" do
        it "builds an InnerJoin with its operands resolved in the given repository" do
          repository = User.find("jan")
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
          join.left_operand.should == repository.blogs
          join.right_operand.should == repository.blog_posts
          join.predicate.left_operand.should == Blog[:id]
          join.predicate.right_operand.should == BlogPost[:blog_id]
        end
      end
    end
  end
end

require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Relations
      describe Union do
        attr_reader :operand_1, :operand_2, :union

        before do
          @operand_1 = BlogPost.where(BlogPost[:blog_id].eq("grain"))
          @operand_2 = BlogPost.where(BlogPost[:blog_id].eq("vegetable"))
          @union = Object.union(operand_1, operand_2)
        end

        describe "#all" do
          it "returns the results of executing the union query" do
            Set.new(union.all).should == Set.new(operand_1.all | operand_2.all)
          end
        end

        describe "a join_to performed on a views based on a union" do
          attr_reader :view

          before do
            @view = union.view(:foo)
            @view.create_view(:temporary)
          end

          after do
            view.drop_view
          end

          it "infers the join column correctly and delivers the appropriate results" do
            union.view(:foo).join_to(Blog).all.should_not be_nil
          end
        end
      end
    end
  end
end

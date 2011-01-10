require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Relations
      describe Limit do
        attr_reader :limit

        before do
          @limit = Blog.limit(2)
        end

        describe "class methods" do
          describe ".from_wire_representation" do
            it "builds an Limit with the specified #n and its #operand resolved in the given repository" do
              repository = UserRepository.new(User.find('jan'))
              representation = {
                "type" => "limit",
                "count" => 2,
                "operand" => {
                  "type" => "table",
                  "name" => "blogs"
                }
              }
              
              limit = Limit.from_wire_representation(representation, repository)
              limit.count.should == 2
              limit.operand.should == repository.resolve_table_name(:blogs)
            end
          end
        end

        describe "#==" do
          it "structurally compares the receiver with the operand" do
            limit.should == Blog.limit(2)
          end
        end
      end
    end
  end
end

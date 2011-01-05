require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Monarch
  module Model
    module Relations
      describe Offset do
        attr_reader :offset

        before do
          @offset = Blog.offset(2)
        end

        describe "class methods" do
          describe ".from_wire_representation" do
            it "builds an Offset with the specified #n and its #operand resolved in the given repository" do
              repository = UserRepository.new(User.find('jan'))
              representation = {
                "type" => "offset",
                "n" => 2,
                "operand" => {
                  "type" => "table",
                  "name" => "blogs"
                }
              }
              
              offset = Offset.from_wire_representation(representation, repository)
              offset.n.should == 2
              offset.operand.should == repository.resolve_table_name(:blogs)
            end
          end
        end

        describe "#==" do
          it "structurally compares the receiver with the operand" do
            offset.should == Blog.offset(2)
          end
        end
      end
    end
  end
end

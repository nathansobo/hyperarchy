require File.expand_path("#{File.dirname(__FILE__)}/../../../monarch_spec_helper")

module Model
  module Tuples
    describe CompositeTuple do
      attr_reader :composite_tuple
      before do
        @composite_tuple = CompositeTuple.new([User.find('jan'), Blog.find('grain')])
      end

      describe "#hash and #eql?" do
        specify "are defined such that array methods such as #uniq and #- work correctly" do
          composite_tuple_2 = CompositeTuple.new([User.find('jan'), Blog.find('grain')])
          [composite_tuple, composite_tuple_2].uniq.should == [composite_tuple]
          ([composite_tuple] - [composite_tuple_2]).should be_empty
        end
      end
    end
  end
end

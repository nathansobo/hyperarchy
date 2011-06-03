require 'spec_helper'

module Prequel
  describe HashExtensions do
    describe "#and_predicate" do
      it "returns a predicate that and's together equality predicates based on the hash's key-value pairs" do
        { :foo => 1, :bar => "baz", :quux => 2 }.and_predicate.should == :foo.eq(1) & :bar.eq("baz") & :quux.eq(2)
      end
    end

    describe "#or_predicate" do
      it "returns a predicate that or's together equality predicates based on the hash's key-value pairs" do
        { :foo => 1, :bar => "baz", :quux => 2 }.or_predicate.should == :foo.eq(1) | :bar.eq("baz") | :quux.eq(2)
      end
    end
  end
end


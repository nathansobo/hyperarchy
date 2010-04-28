require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Monarch
  module Util
    describe SubscriptionNode do
      attr_reader :node, :subscription_1, :subscription_2,  :subscription_1_args, :subscription_2_args
      before do
        @node = SubscriptionNode.new
        @subscription_1_args = []
        @subscription_2_args = []

        @subscription_1 = node.subscribe do |arg_1, arg_2|
          subscription_1_args.push([arg_1, arg_2])
        end

        @subscription_2 =  node.subscribe do |arg_1, arg_2|
          subscription_2_args.push([arg_1, arg_2])
        end
      end

      describe "#publish and #subscribe" do
        specify "callbacks registered with #subscribe are triggered when #publish is called, unless their subscription is destroyed" do
          node.publish("x", "y")
          subscription_1_args.should == [["x", "y"]]
          subscription_2_args.should == [["x", "y"]]

          subscription_1.destroy
          node.publish("q", "x")
          subscription_1_args.should == [["x", "y"]]
          subscription_2_args.should == [["x", "y"], ["q", "x"]]

          subscription_2.destroy
          node.publish("z", "a")
          subscription_1_args.should == [["x", "y"]]
          subscription_2_args.should == [["x", "y"], ["q", "x"]]
        end
      end

      describe "#pause and #resume" do
        specify "#pause enqueues events and does not fire callbacks until #resume flushes them, after which callbacks are triggered normally" do
          node.pause
          node.publish("a", "b")
          node.publish("x", "y")

          subscription_1_args.should be_empty
          subscription_2_args.should be_empty

          node.resume

          subscription_1_args.should == [["a", "b"], ["x", "y"]]
          subscription_2_args.should == [["a", "b"], ["x", "y"]]

          node.publish("foo", "bar")

          subscription_1_args.should == [["a", "b"], ["x", "y"], ["foo", "bar"]]
          subscription_2_args.should == [["a", "b"], ["x", "y"], ["foo", "bar"]]
        end
      end

      describe "#pause and #cancel" do
        specify "#pause enqueues events and does not fire callbacks, then #cancel does not flush enqueued events but causes callbacks to trigger normally after it is called" do
          node.pause
          node.publish("a", "b")

          subscription_1_args.should be_empty
          subscription_2_args.should be_empty

          node.cancel

          subscription_1_args.should be_empty
          subscription_2_args.should be_empty

          node.publish("foo", "bar")

          subscription_1_args.should == [["foo", "bar"]]
          subscription_2_args.should == [["foo", "bar"]]
        end
      end
    end
  end
end

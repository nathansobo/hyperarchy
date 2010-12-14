require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Monarch
  module Rack
    describe RealTimeClient do
      attr_reader :client, :hub

      before do
        @hub = Object.new
        @client = RealTimeClient.new("sample-client-id", hub)
        publicize client, :went_offline
      end

      after do
        client.unsubscribe_all
      end

      describe "#subscribe and #unsubscribe" do
        context "when #subscribe is called with a subscription node" do
          attr_reader :node
          before do
            @node = Monarch::Util::SubscriptionNode.new
          end

          it "sends anything published on the node to the client" do
            client.subscribe(node)
            message = ["foo", {"bar" => "baz"}]
            mock(client).send(message)
            node.publish(message)
          end

          it "does not allow redundant subscriptions to the same node" do
            client.subscribe(node)
            client.subscribe(node)
            message = ["foo", {"bar" => "baz"}]
            mock(client).send(message)
            node.publish(message)
          end
        end

        context "when #subscribe is called with a relation" do
          specify "#subscribe causes all insert, update, and remove events on the given relation to send a message to the client and #unsubscribe cancels those events" do
            Timecop.freeze(Time.now)
            subscription_1_id = client.subscribe(BlogPost.table)

            sent_message = nil
            stub(client).send do |message|
              sent_message = message
            end

            record = BlogPost.create!(:title => "FiberForce Muffins", :body => "Betcha can't eat these.")
            sent_message.should == ["create", "blog_posts", {"created_at"=>nil, "title"=>"FiberForce Muffins", "body"=>"Betcha can't eat these.", "featured"=>nil, "blog_id"=>nil, "id" => record.id, "created_at" => Time.now.to_millis, "updated_at" => Time.now.to_millis }]

            RR.reset_double(client, :send)

            expected_message = ["update", "blog_posts", record.id, { "title" => "Tejava", "body" => "I love this tea and so does Brian Takita!" }]
            mock(client).send(expected_message)
            record.update(:title => "Tejava", :body => "I love this tea and so does Brian Takita!")

            expected_message = ["destroy", "blog_posts", record.id]
            mock(client).send(expected_message)
            record.destroy

            client.subscribe(Blog.table)
            client.unsubscribe(subscription_1_id)

            dont_allow(client).send
            blog_post = BlogPost.create!(:title => "This one should have no event", :body => "Event free")

            blog = Blog.find("grain")
            expected_message = ["update", "blogs", blog.id, { "title" => "My new title" }]
            RR.reset_double(client, :send)
            mock(client).send(expected_message)
            blog.update(:title => "My new title")

            subscription_3_id = client.subscribe(BlogPost.table)
            subscription_3_id.should_not == subscription_1_id

            expected_message = ["update", "blog_posts", blog_post.id, { "title" => "Kukicha" }]
            mock(client).send(expected_message)
            blog_post.update(:title => "Kukicha")
          end
        end
      end

      describe "#went_offline" do
        it "removes itself from the hub and destroys all of its subscriptions" do
          mock(hub).remove_client(client.id)
          client.subscribe(BlogPost.table)

          lambda do
            client.went_offline
          end.should change { BlogPost.table.num_subscriptions }.by(-3)
        end
      end
    end
  end
end

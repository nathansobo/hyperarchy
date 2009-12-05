require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe Dispatcher do
    attr_reader :client

    before do
      @client = CometClient.new("sample-comet-client-id", nil)
    end

    describe "#subscribe(relation)" do
      it "causes all inserts on the given relation to send a message to the client" do
        relation = BlogPost.where(BlogPost[:blog_id].eq("grain"))
        client.subscribe(relation)

        expected_message = ['create', 'blog_posts', { :blog_id => "grain", :title => "FiberForce Muffins", :body => "Betcha can't eat these.", :created_at => nil }].to_json
        mock(client.send(expected_message))

        relation.create(:title => "FiberForce Muffins", :body => "Betcha can't eat these.")
      end
    end
  end
end

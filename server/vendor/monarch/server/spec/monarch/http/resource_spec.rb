require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe Resource do
    attr_reader :resource
    before do
      @resource = Resource.new
    end

    describe "#ajax_response(successful, data, records_or_relations)" do
      context "when passed an array of records or relations" do
        it "adds the records to a relational dataset by calling add_to_relational_dataset on each" do
          user = User.find('jan')
          status, headers, body = resource.ajax_response(true, { 'foo' => "bar" }, [user, user.blogs])

          status.should == 200
          headers.should == {"Content-Type" => "application/json"}
          body_from_json = JSON.parse(body)

          body_from_json['data'].should == { 'foo' => "bar"}
          body_from_json['dataset']['users'][user.id.to_s].should == user.wire_representation
          user.blogs.each do |blog|
            body_from_json['dataset']['blogs'][blog.id.to_s].should == blog.wire_representation
          end
        end
      end
    end
  end
end

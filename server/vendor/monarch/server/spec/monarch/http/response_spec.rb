require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe Response do

    describe "#ok?" do
      it "returns true if status is 200" do
        Response.new(200, {}, "body").should be_ok
        Response.new(404, {}, "body").should_not be_ok
      end
    end

    describe "#cookies" do
      attr_reader :response

      before do
        @response = Response.new(200, { 'Set-Cookie' => ['foo=bar', 'baz=bop'] }, "body")
      end

      describe "reading" do
        it "returns the cookie value from the 'Set-Cookie' header for the given key" do
          response.cookies['foo'].should == 'bar'
          response.cookies['baz'].should == 'bop'
        end
      end

      describe "assignment" do
        it "adds a 'Set-Cookie' header with the given key and value" do
          response.cookies['tibet'] = 'shambhala'
          response.headers['Set-Cookie'].should include("tibet=shambhala")
        end
      end
    end

    describe "#body_as_json" do
      it "returns the JSON-parsed #body" do
        data = {
          "foo" => "foo",
          "bar" => "baz"
        }
        response = Response.new(200, {}, data.to_json)
        response.body_as_json.should == data
      end
    end
  end
end

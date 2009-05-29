require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Http
  describe Response do
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
  end
end
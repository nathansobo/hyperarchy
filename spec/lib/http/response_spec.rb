require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Http
  describe Response do
    describe "#cookies" do
      describe "reading" do
        it "returns the cookie value from the Set-Cookie header for the given key" do
          response = Response.new(200, { 'Set-Cookie' => ['foo=bar', 'baz=bop'] }, "body")

          response.cookies['foo'].should == 'bar'
          response.cookies['baz'].should == 'bop'
        end

      end

      describe "assignment" do

      end
    end
  end
end
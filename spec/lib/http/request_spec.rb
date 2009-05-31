require File.expand_path("#{File.dirname(__FILE__)}/../../hyperarchy_spec_helper")

module Http
  describe Request do
    attr_reader :request

    describe "#session_id" do
      before do
        @request = Request.new({'hyperarchy.session_id' => 'a-session-id'})
      end

      it "return the 'hyperarchy.session_id' value from the environment" do
        request.session_id.should == request.env['hyperarchy.session_id']
      end
    end

    describe "#session_id=" do
      before do
        @request = Request.new({})
      end

      it "sets the 'hyperarchy.session_id' value in the environment" do
        request.session_id = "fake-session-id"
        request.env['hyperarchy.session_id'].should == "fake-session-id"
      end
    end

    describe "#cookies" do
      before do
        @request = Request.new({'HTTP_COOKIES' => 'foo=bar; baz=bop'})
      end

      describe "reading" do
        it "returns the cookie value from the HTTP_COOKIES string for the given key" do
          request.cookies['foo'].should == 'bar'
          request.cookies['baz'].should == 'bop'
        end
      end

      describe "assignment" do
        it "adds the given key value pair to the cookie string" do
          request.cookies['moon'] = 'sun'
          cookies = request.env['HTTP_COOKIES'].split("; ")
          cookies.should include('foo=bar')
          cookies.should include('baz=bop')
          cookies.should include('moon=sun')
        end
      end
    end
  end
end

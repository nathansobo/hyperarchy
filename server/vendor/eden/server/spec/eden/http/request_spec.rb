require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Http
  describe Request do
    attr_reader :request

    describe "#params" do
      context "if the Request has a 'Content-Type' header with a media type of 'application/x-www-form-urlencoded'" do
        it "returns the union of #url_params and #body_params" do
          request = Request.new({
            'CONTENT_TYPE' => 'application/x-www-form-urlencoded; charset=utf-8'
          })
          mock(request).url_params {{ :baz => "bop" }}
          mock(request).body_params {{ :foo => "bar" }}

          request.params.should == {
            :foo => "bar",
            :baz => "bop"
          }
        end
      end

      context "if the Request does NOT have a 'Content-Type' header with a media type of 'application/x-www-form-urlencoded'" do
        it "returns only the #url_params" do
          request = Request.new({
            'CONTENT_TYPE' => 'something else; charset=utf-8'
          })
          mock(request).url_params {{ :baz => "bop" }}
          dont_allow(request).body_params

          request.params.should == {
            :baz => "bop"
          }
        end
      end
    end

    describe "#body_params" do
      context "if the Request has a 'Content-Type' header with a media type of 'application/x-www-form-urlencoded'" do
        it "returns a hash of the decoded parameters from the request body and rewinds the input" do
          input = StringIO.new('foo=bar&baz=bop')
          request = Request.new({
            'rack.input' => input,
            'CONTENT_TYPE' => 'application/x-www-form-urlencoded; charset=utf-8'
          })
          mock.proxy(input).rewind
          request.body_params.should == {
            :foo => "bar",  
            :baz => "bop"
          }
        end
      end

      context "if the Request does NOT have a 'Content-Type' header with a media type that is NOT 'application/x-www-form-urlencoded'" do
        it "raises an exception" do
          request = Request.new({
            'CONTENT_TYPE' => 'something else; charset=utf-8',
            'rack.input' => StringIO.new(""),
          })
          lambda do
            request.body_params
          end.should raise_error
        end
      end
    end

    describe "#url_params" do
      it "returns a hash of the url params" do
        request = Request.new({
          'QUERY_STRING' => 'foo=bar&baz=bop'
        })

        request.url_params.should == {
          :foo => "bar",
          :baz => "bop"
        }
      end
    end

    describe "#path_info" do
      it "returns the 'PATH_INFO' value from the environment" do
        request = Request.new({'PATH_INFO' => "/foo/bar"})
        request.path_info.should == request.env['PATH_INFO']
      end
    end

    describe "#path_info=" do
      it "assigns the 'PATH_INFO' value in the environment" do
        request = Request.new({})
        request.path_info = "/foo/bar"
        request.env['PATH_INFO'].should == "/foo/bar"
      end
    end

    describe "#method" do
      it "returns the 'REQUEST_METHOD' value from the environment, downcased, as a symbol" do
        request = Request.new({'REQUEST_METHOD' => "GET"})
        request.method.should == :get
      end
    end

    describe "#method=" do
      it "assigns the 'REQUEST_METHOD' value in the environment to the given symbol, upcased and turned into a string" do
        request = Request.new({})
        request.method = :post
        request.env['REQUEST_METHOD'].should == "POST"
      end
    end

    describe "#session_id" do
      before do
        @request = Request.new({'hyperarchy.session_id' => 'a-session-id'})
      end

      it "returns the 'hyperarchy.session_id' value from the environment" do
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

require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Http
  describe AssetService do
    attr_reader :asset_service, :proxied_app, :asset_manager, :dir
    before do
      @proxied_app = Object.new
      @asset_manager = Object.new
      @asset_service = AssetService.new(proxied_app, asset_manager)
      @dir = File.dirname(__FILE__)
    end

    describe "#call" do
      context "when the virtual path of the given request can be physicalized" do
        context "when a file exists at the physicalized path" do
          it "responds with the file's contents and does not proxy through to the next layer of the rack stack" do
            request = TestRequest.new
            request.path_info = "/extant_file/1.js"
            physical_path = "#{dir}/../util/file_system_fixtures_for_asset_manager_specs/dir_1/1.js"
            mock(asset_manager).physicalize_path("/extant_file/1.js") { physical_path }
            dont_allow(proxied_app).call(request.env)

            response = Response.new(*asset_service.call(request.env))

            response.should be_ok
            response.headers['Last-Modified'].should == ::File.mtime(physical_path).httpdate


            response_body = ""
            response.body.each { |chunk| response_body.concat(chunk) }
            response_body.should == ::File.read(physical_path)
          end
        end

        context "when no file exists at the physicalized path" do
          it "proxies the request through to #app" do
            request = TestRequest.new
            request.path_info = "/no/file/here.js"
            mock(asset_manager).physicalize_path("/no/file/here.js") { "#{dir}/file_system_fixtures_for_asset_managar_specs/dir_1/bogus.js" }
            mock(proxied_app).call(request.env)
            asset_service.call(request.env)
          end
        end
      end

      context "when the virtual path of the given request cannot be physicalized" do
        it "proxies the request through to #app" do
          request = TestRequest.new
          request.path_info = "/no/physical/counterpart"
          mock(asset_manager).physicalize_path("/no/physical/counterpart") { nil }
          mock(proxied_app).call(request.env)
          asset_service.call(request.env)
        end
      end
    end
  end
end

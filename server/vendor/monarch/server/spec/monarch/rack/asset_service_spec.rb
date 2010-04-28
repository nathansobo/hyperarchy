require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Monarch
  module Rack
    describe AssetService, :type => :rack do
      attr_reader :proxied_app, :asset_manager, :dir
      before do
        @proxied_app = proxied_app = Object.new
        @asset_manager = asset_manager = Object.new
        @asset_service = AssetService.new(proxied_app, asset_manager)
        @dir = ::File.dirname(__FILE__)
        @app = ::Rack::Builder.new do
          use AssetService, asset_manager
          run proxied_app
        end
      end

      def app
        @app
      end

      describe "#call" do
        context "when the virtual path of the given request can be physicalized" do
          context "when a file exists at the physicalized path" do
            it "responds with the file's contents and does not proxy through to the next layer of the rack stack" do
              virtual_path = "/extant_file/1.js"
              physical_path = "#{dir}/asset_service/file_system_fixtures_for_asset_manager_specs/dir_1/1.js"
              mock(asset_manager).physicalize_path("/extant_file/1.js") { physical_path }
              dont_allow(proxied_app).call

              get virtual_path

              last_response.should be_ok
              last_response.headers['Last-Modified'].should == ::File.mtime(physical_path).httpdate
              last_response_body = ""
              last_response.body.each { |chunk| last_response_body.concat(chunk) }
              last_response_body.should == ::File.read(physical_path)
            end
          end

          context "when no file exists at the physicalized path" do
            it "proxies the request through to #lib" do
              virtual_path = "/no/file/here.js"
              mock(asset_manager).physicalize_path(virtual_path) { "#{dir}/file_system_fixtures_for_asset_managar_specs/dir_1/bogus.js" }
              mock(proxied_app).call(is_a(Hash)) do |env|
                env['PATH_INFO'].should == virtual_path
                [200, {}, "mock body"]
              end
              get virtual_path
              last_response.body.should == "mock body"
            end
          end
        end

        context "when the virtual path of the given request cannot be physicalized" do
          it "proxies the request through to #lib" do
            virtual_path = "/no/physical/counterpart"
            mock(asset_manager).physicalize_path(virtual_path) { nil }
            mock(proxied_app).call(is_a(Hash)) do |env|
              env['PATH_INFO'].should == virtual_path
              [200, {}, "mock body"]
            end
            get virtual_path
            last_response.body.should == "mock body"
          end
        end
      end
    end
  end
end

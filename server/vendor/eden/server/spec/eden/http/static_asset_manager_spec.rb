require File.expand_path("#{File.dirname(__FILE__)}/../../eden_spec_helper")

module Http
  describe StaticAssetManager do
    attr_reader :dir, :proxied_app
    before do
      @dir = File.dirname(__FILE__)
      @proxied_app = Object.new
      StaticAssetManager.new(proxied_app)
      StaticAssetManager.add_js_directory("#{dir}/public_dir_spec/exposed_public_dir_1", "/virtual_dir_1")
      StaticAssetManager.add_js_directory("#{dir}/public_dir_spec/external_public_dir_2", "/virtual_dir_2")
    end

    describe ".new(proxied_app)" do
      it "assigns the proxied app on the instance" do
        StaticAssetManager.instance.proxied_app.should == proxied_app
      end
    end

    describe "#dependency_paths(*js_source_files)" do
      it "computes the relative paths of all dependencies of the given javascript paths, accounting for virtual subdirectories" do
        expected_relative_paths = [
          "/virtual_dir_1/duplicated_dependency.js",
          "/virtual_dir_1/dependency_1.js",
          "/virtual_dir_1/exposed_public_subdir/dependency_3.js",
          "/virtual_dir_1/top_level_1.js",
          "/virtual_dir_1/top_level_2.js"
        ]
        StaticAssetManager.dependency_paths('top_level_1.js', 'top_level_2.js').should == expected_relative_paths
      end
    end

    describe "#call(rack_env)" do
      attr_reader :request

      before do
        @request = TestRequest.new
      end

      context "when the given path corresponds to a registered virtual prefix" do
        context "when a file exists at the corresponding physical location" do
          it "returns the contents of the file at the physical location" do
            request.path_info = "/virtual_dir_1/dependency_1.js"
            response = Response.new(*StaticAssetManager.instance.call(request.env))

            expected_physical_path = "#{dir}/public_dir_spec/exposed_public_dir_1/dependency_1.js"
            response.status.should == 200
            response.headers.should == {"Last-Modified" => File.mtime(expected_physical_path).httpdate, "Content-Type" => "application/javascript", "Content-Length" => "18"}
            response.body.should be_an_instance_of(Rack::File)
            response.body.path.should == expected_physical_path
          end
        end

        context "when no file exists at the corresponding physical location" do
          it "proxies the request through to #proxied_app" do
            request.path_info = "/virtual_dir_1/dependency_x.js"
            env = request.env
            mock(proxied_app).call(env)
            StaticAssetManager.instance.call(env)
          end
        end
      end

      context "when the given path does not correspond to a registered virtual prefix" do
        it "proxies the request through to #proxied_app" do
          request.path_info = "/not_a/virtual_prefix"
          env = request.env
          mock(proxied_app).call(env)
          StaticAssetManager.instance.call(env)
        end
      end
    end
  end
end

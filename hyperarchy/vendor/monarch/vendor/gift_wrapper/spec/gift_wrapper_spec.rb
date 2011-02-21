require File.expand_path("#{File.dirname(__FILE__)}/gift_wrapper_spec_helper")


describe GiftWrapper do
  attr_reader :wrapper, :dir, :fdir, :package_dir, :proxied_app

  before do
    @proxied_app = lambda { [200, {}, "proxied_app response"] }
    GiftWrapper.app = proxied_app
    @dir = File.expand_path(File.dirname(__FILE__))
    @fdir = "#{dir}/fixtures"
    @package_dir = "#{fdir}/pkg"

    GiftWrapper.mount_package_dir(package_dir)
  end

  after do
    GiftWrapper.clear_instance
  end

  def initialize_package_dir
    Dir.mkdir(package_dir) unless File.exist?(package_dir)
    if Dir["#{package_dir}/*"].length > 0
      system("rm #{package_dir}/*")
    end
  end

  describe "#require_js(script_paths*)" do
    before do
      GiftWrapper.mount("#{fdir}/a", "/x")
      GiftWrapper.mount("#{fdir}/b", "/x/y")
      GiftWrapper.mount("#{fdir}/b/c", "/z")
    end

    describe "when in development mode" do
      before do
        GiftWrapper.development_mode = true
      end

      it "returns the expanded require graph of the scripts at the given paths (located on the load path)" do
        locations = GiftWrapper.require_js("1")
        locations.should == ["/z/3.js", "/x/y/d/4.js", "/x/y/2.js", "/x/1.js"]
      end
    end

    describe "when in production mode" do
      before do
        initialize_package_dir
      end

      after do
        initialize_package_dir
      end

      it "returns the path of the combined file corresponding to the given paths" do
        digest = GiftWrapper.combine_js("1")
        GiftWrapper.require_js("1").should == ["/pkg/minified.#{digest}.js"]
      end
    end
  end

  describe "#combine_js(script_paths*)" do
    before do
      initialize_package_dir
    end

    after do
      initialize_package_dir
    end

    it "writes a combined file, a minified file, and updates the gift_wrapper.yml metadata based on 'require' directives in the scripts at the given paths" do
      metadata = {
        ['foo', 'bar'] => "existingdigest"
      }
      metadata_path = "#{package_dir}/gift_wrapper.yml"

      File.open(metadata_path, "w") do |file|
        YAML.dump(metadata, file)
      end

      GiftWrapper.mount("#{fdir}/a", "/x")
      GiftWrapper.mount("#{fdir}/b", "/x/y")
      GiftWrapper.mount("#{fdir}/b/c", "/z")

      digest = GiftWrapper.combine_js("1")

      combined_file_path = Dir["#{package_dir}/combined.#{digest}.js"].first
      combined_file_path.should_not be_nil
      file_contents = File.read(combined_file_path)
      Digest::SHA1.hexdigest(file_contents).should == digest
      file_contents.should match(/.*var file_3;.*var file_4;.*var file_2;.*var file_1;.*/m)

      Dir["#{package_dir}/minified.#{digest}.js"].length.should == 1

      new_metadata = YAML.load_file(metadata_path)

      new_metadata[['foo', 'bar']].should == metadata[['foo', 'bar']]
      new_metadata[['1']].should == digest
    end
  end

  describe "#resolve_web_path" do
    it "returns the mounted location with the most specific web path prefix, if one exists" do
      GiftWrapper.mount("#{fdir}/a", "/x")
      GiftWrapper.mount("#{fdir}/b", "/x/y")

      loc_1 = GiftWrapper.resolve_web_path("/x/1.js")
      loc_1.web_path.should == "/x/1.js"
      loc_1.physical_path.should == "#{fdir}/a/1.js"

      loc_2 = GiftWrapper.resolve_web_path("/x/y/2.js")
      loc_2.web_path.should == "/x/y/2.js"
      loc_2.physical_path.should == "#{fdir}/b/2.js"

      GiftWrapper.resolve_web_path("/crap").should be_nil
    end
  end

  describe "#resolve_physical_path" do
    it "returns the mounted location with the most specific physical location" do
      GiftWrapper.mount("#{dir}/fixtures/a", "/x")
      GiftWrapper.mount("#{dir}/fixtures/b", "/x/y")
      GiftWrapper.mount("#{dir}/fixtures/b/c", "/z")

      loc_1 = GiftWrapper.resolve_physical_path("#{fdir}/a/1.js")
      loc_1.physical_path.should == "#{fdir}/a/1.js"
      loc_1.web_path.should == "/x/1.js"

      loc_2 = GiftWrapper.resolve_physical_path("#{fdir}/b/2.js")
      loc_2.physical_path.should == "#{fdir}/b/2.js"
      loc_2.web_path.should == "/x/y/2.js"

      loc_2 = GiftWrapper.resolve_physical_path("#{fdir}/b/c/3.js")
      loc_2.physical_path.should == "#{fdir}/b/c/3.js"
      loc_2.web_path.should == "/z/3.js"

      GiftWrapper.resolve_physical_path("/garbage").should be_nil
    end
  end

  describe "#call(RACK_ENV)" do
    include Rack::Test::Methods

    def app
      GiftWrapper
    end

    before do
      GiftWrapper.mount("#{dir}/fixtures/a", "/x")
    end

    context "when the given PATH_INFO maps to a mounted location" do
      context "when a file exists at that location" do
        it "returns the contents of the file as response and does not forward the request to the next layer of the rack stack" do
          web_path = "/x/1.js"
          physical_path = GiftWrapper.resolve_web_path(web_path).physical_path

          get web_path

          last_response.should be_ok
          last_response.headers['Last-Modified'].should == ::File.mtime(physical_path).httpdate
          last_response_body = ""
          last_response.body.each { |chunk| last_response_body.concat(chunk) }
          last_response_body.should == File.read(physical_path)
        end
      end

      context "when no file exists at that location" do
        it "forwards the request to the next layer of the rack stack" do
          mock.proxy(proxied_app).call(is_a(Hash))
          get "/x/bogus.js"
          last_response.body.should == "proxied_app response"
        end
      end

      context "when the path includes '..' characters" do
        it "returns forbidden for security" do
          get "/x/../../gift_wrapper_spec.rb"

          last_response.should be_forbidden
        end
      end
    end

    context "when the given PATH_INFO does not map to a mounted location" do
      it "forwards the request to the next layer of the rack stack" do
        mock.proxy(proxied_app).call(is_a(Hash))
        get "/lala/land"
        last_response.body.should == "proxied_app response"
      end
    end
  end
end
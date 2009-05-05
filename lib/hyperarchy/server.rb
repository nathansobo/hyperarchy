class Server
  class << self
    attr_reader :instance

    def start(options)
      @instance = new
      instance.start(options)
    end

    delegate :load_fixtures, :compile_public_assets, :to => :instance
  end

  def start(options)
    load_fixtures
    compile_public_assets

    port = options.delete(:port) || 8080
    Thin::Server.start(port) do
      run Dispatcher.instance
    end
  end

  def load_fixtures
    require "#{HYPERARCHY_ROOT}/spec/hyperarchy/fixtures"
    GlobalDomain.load_fixtures
  end

  def compile_public_assets
    secretary = Sprockets::Secretary.new(
      :root         => HYPERARCHY_ROOT,
      :asset_root   => "public",
      :load_path    => ["javascript/**/*"],
      :source_files => ["javascript/lib/hyperarchy.js"]
    )
    secretary.concatenation.save_to("public/all.js")
  end
end
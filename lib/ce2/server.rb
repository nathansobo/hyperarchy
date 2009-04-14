class Server
  def self.start(options)
    new.start(options)
  end

  def start(options)
    compile_public_assets

    port = options.delete(:port) || 8080
    Thin::Server.start(port) do
      run Dispatcher.instance
    end
  end

  def compile_public_assets
    secretary = Sprockets::Secretary.new(
      :root         => CE2_ROOT,
      :asset_root   => "public",
      :load_path    => ["javascript/**/*"],
      :source_files => ["javascript/ce2.js"]
    )

  end
end
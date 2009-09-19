module Http
  class AssetService
    attr_reader :app, :asset_manager

    def initialize(app, asset_manager)
      @app, @asset_manager = app, asset_manager
    end

    def call(env)
      request = Request.new(env)
      physical_path = asset_manager.physicalize_path(request.path_info)

      if physical_path && File.exists?(physical_path)
        file = Rack::File.new(nil)
        file.path = physical_path
        file.serving
      else
        app.call(env)
      end
    end
  end
end

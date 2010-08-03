module RunLater
  
  # Cleanup code. Will only be used when cache_classes is disabled, so usually
  # in development and testing mode. Ensures that the worker thread is properly
  # disposed of before Rails' class unloading kicks in.
  class Cleanup
    def initialize(app)
      @app = app
    end
  
    def call(env)
      @app.call(env)
    ensure
      RunLater::Worker.cleanup
    end
  end

end
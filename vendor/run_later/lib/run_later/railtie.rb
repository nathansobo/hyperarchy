require 'run_later'
require 'rails'

module RunLater
  
  class Railtie < Rails::Railtie

    initializer "run_later.configure_rails_initialization" do |app|
      unless app.config.cache_classes
        app.middleware.use RunLater::Cleanup
        # ActionController::Dispatcher.middleware.push(ActionController::MiddlewareStack::Middleware.new(RunLater::Cleanup))
      end
    end
       
  end
  
end
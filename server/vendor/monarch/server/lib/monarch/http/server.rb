module Warden
  module Strategies
    class BCryptStrategy < Base
      def valid?
        params["email_address"] || params["password"]
      end

      def authenticate!
        unless user = User.find(:email_address => params["email_address"])
          errors.add(:email_address, "No user found with that email address.")
          fail!
          return
        end

        if user.password == params["password"]
          success!(user)
        else
          errors.add(:password, "Incorrect password.")
          fail!
        end
      end
    end

    add(:bcrypt, BCryptStrategy)
  end
end

Application = Rack::Builder.new do
  use Rack::ContentLength
#  use Rack::ShowExceptions
  use Http::AssetService, Util::AssetManager.instance
  use Rack::Session::Cookie
  use Warden::Manager do |manager|
    manager.default_strategies :bcrypt
    manager.serialize_into_session do |user|
      user.id
    end
    manager.serialize_from_session do |id|
      User.find(id)
    end
  end
  run Http::Dispatcher.new(Util::ResourceLocator.new)
end

module Http
  class Server
    attr_reader :thin
    delegate :start, :stop, :to => :thin

    def initialize(options={})
      @thin = Thin::Server.new(options[:port] || 8080, Application)
    end
  end
end

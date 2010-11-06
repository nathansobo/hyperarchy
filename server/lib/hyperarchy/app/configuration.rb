module Hyperarchy
  def self.defer(&block)
    EM.defer do
      begin
        block.call
      rescue Exception => e
        msg = ["#{e.class} - #{e.message}:", *e.backtrace].join("\n ")
        LOGGER.error(msg)
      end
    end
  end

  class App < Sinatra::Base
    configure(:development) do
      require 'new_relic/rack_app'
      use NewRelic::Rack::DeveloperMode
    end

    use Monarch::Rack::IdentityMapManager unless RACK_ENV == "test"
    use Rack::Session::Cookie
    use Rack::Flash
    use Warden::Manager do |manager|
      manager.default_strategies :bcrypt
      manager.serialize_into_session do |user|
        user.id
      end
      manager.serialize_from_session do |id|
        User.find(id)
      end
    end

    configure(:development) do
      use GiftWrapper
      use Sass::Plugin::Rack
    end

    register Monarch
    helpers Hyperarchy::Helpers

    Origin.connection = Sequel.postgres("hyperarchy_#{RACK_ENV}", :user => 'hyperarchy', :encoding => 'utf8')
    SubscriptionManager.start unless RACK_ENV == 'test'

    configure(:test) do
      GiftWrapper.development_mode = true
      ::LOGGER = Logger.new($stdout)
      Mailer.use_fake
      Mailer.base_url = "hyperarchy.com"
      Monarch::Model::convert_strings_to_keys = true
    end

    configure(:development) do
      GiftWrapper.development_mode = true
      Sass::Plugin.options[:template_location] = { "#{CLIENT_ROOT}/stylesheets" => "#{CLIENT_ROOT}/stylesheets" }
      ::LOGGER = Logger.new(STDOUT)
      Mailer.base_url = "localhost:9000"
      Mailer.default_options = {
        :from => '"Hyperarchy" <admin@hyperarchy.com>',
        :via => :smtp,
        :via_options => {
          :address => "localhost",
          :port => 2525,
        }
      }

      register Sinatra::Reloader
      dir = File.dirname(__FILE__)
      also_reload "#{dir}/../*.rb"
      also_reload "#{dir}/../models/*.rb"
      also_reload "#{dir}/../views/*.rb"
    end

    configure(:demo) do
      Mailer.base_url = "demo.hyperarchy.com"

      ::LOGGER = Logger.new($stdout)

      Mailer.default_options = {
        :via => :smtp,
        :from => '"Hyperarchy" <admin@hyperarchy.com>',
        :via_options => {
          :address => "smtp.gmail.com",
          :port => 587,
          :user_name => "admin@hyperarchy.com",
          :password => "eltortuga",
          :authentication => :plain,
          :domain => "hyperarchy.com"
        }
      }
    end

    configure(:production) do
      Mailer.base_url = "hyperarchy.com"

      ::LOGGER = Logger.new($stdout)

      Mailer.default_options = {
        :from => '"Hyperarchy" <admin@hyperarchy.com>',
        :via => :smtp,
        :via_options => {
          :address => "smtp.gmail.com",
          :port => 587,
          :user_name => "admin@hyperarchy.com",
          :password => "eltortuga",
          :authentication => :plain,
          :domain => "hyperarchy.com"
        }
      }
    end

    ::LOGGER.level = Logger::INFO

    Warden::Manager.after_set_user do |user, auth, options|
      Monarch::Model::Repository.current_user = user
    end

    ::ALPHA_TEST_ORG_NAME = "Alpha Testers"
  end
end
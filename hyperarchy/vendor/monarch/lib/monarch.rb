dir = File.dirname(__FILE__)
MONARCH_ROOT = File.expand_path(File.join(dir, '..', '..'))
MONARCH_CLIENT_ROOT = File.expand_path(File.join(MONARCH_ROOT, 'client'))
MONARCH_SERVER_ROOT = File.expand_path(File.join(MONARCH_ROOT, 'server'))

require "rubygems"
require "sequel"
require "guid"
require "json"

require "#{dir}/monarch/core_extensions"
require "#{dir}/monarch/util"
require "#{dir}/monarch/model"
require "#{dir}/monarch/helpers"

#require "#{dir}/monarch/rack"
#require "#{dir}/../vendor/gift_wrapper/lib/gift_wrapper"

module Monarch
  class << self
    def registered(app)
      app.helpers Monarch::Helpers, Util::BuildRelationalDataset
      app.use Rack::RealTimeHub

      app.get "#{MONARCH_PATH_PREFIX}/repository/fetch" do
        dataset = exposed_repository.fetch(params[:relations].from_json)
        successful_json_response(nil, dataset)
      end

      app.post "#{MONARCH_PATH_PREFIX}/repository/mutate" do
        successful, response_data = exposed_repository.mutate(params[:operations].from_json)
        json_response(successful, response_data)
      end

      app.post "#{MONARCH_PATH_PREFIX}/repository/subscribe" do
        raise "No real time client" unless current_real_time_client
        successful, response_data = exposed_repository.subscribe(current_real_time_client, params[:relations].from_json)
        json_response(successful, response_data)
      end

      app.post "#{MONARCH_PATH_PREFIX}/repository/unsubscribe" do
        raise "No real time client" unless current_real_time_client
        successful = exposed_repository.unsubscribe(current_real_time_client, params[:subscription_ids].from_json)
        json_response(successful, "")
      end
    end
  end

  class Unauthorized < Exception
    def code
      401
    end
  end
end
  
Origin = Monarch::Model::RemoteRepository.new

#MONARCH_PATH_PREFIX = "" unless defined?(MONARCH_PATH_PREFIX)
#GiftWrapper.mount("#{MONARCH_CLIENT_ROOT}/lib", "#{MONARCH_PATH_PREFIX}/monarch/lib")
#GiftWrapper.mount("#{MONARCH_CLIENT_ROOT}/vendor", "#{MONARCH_PATH_PREFIX}/monarch/vendor")

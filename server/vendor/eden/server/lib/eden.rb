dir = File.dirname(__FILE__)
EDEN_SERVER_ROOT = File.expand_path(File.join(dir, '..', '..'))
EDEN_CLIENT_SERVER_ROOT = File.expand_path(File.join(EDEN_SERVER_ROOT, 'client'))
EDEN_SERVER_SERVER_ROOT = File.expand_path(File.join(EDEN_SERVER_ROOT, 'server'))

require "rubygems"
require "thin"
require "sequel"
require "sequel/extensions/inflector"
require "guid"
require "json"
require "active_support/ordered_hash"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/hash/keys"
require "active_support/core_ext/string/starts_ends_with"
require "#{EDEN_SERVER_SERVER_ROOT}/vendor/sprockets/lib/sprockets"

require "#{dir}/eden/model"
require "#{dir}/eden/http"
require "#{dir}/eden/core_extensions"

class String
 include ActiveSupport::CoreExtensions::String::StartsEndsWith
end

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Origin = Model::Repository.new

Http::StaticAssetManager.add_js_directory("#{EDEN_CLIENT_SERVER_ROOT}/lib", "/eden/lib")
Http::StaticAssetManager.add_js_directory("#{EDEN_CLIENT_SERVER_ROOT}/vendor", "/eden/vendor")

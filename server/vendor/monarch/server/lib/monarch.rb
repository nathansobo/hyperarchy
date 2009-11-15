dir = File.dirname(__FILE__)
MONARCH_SERVER_ROOT = File.expand_path(File.join(dir, '..', '..'))
MONARCH_CLIENT_SERVER_ROOT = File.expand_path(File.join(MONARCH_SERVER_ROOT, 'client'))
MONARCH_SERVER_SERVER_ROOT = File.expand_path(File.join(MONARCH_SERVER_ROOT, 'server'))

require "rubygems"
require "thin"
require "sequel"
require "sequel/extensions/inflector"
require "guid"
require "json"

if defined?(XMPP_ENABLED) && XMPP_ENABLED
  require "blather"
  require "blather/client/dsl" 
end

require "active_support/ordered_hash"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/hash/keys"
require "active_support/core_ext/hash/indifferent_access"
require "active_support/core_ext/string/starts_ends_with"
require "active_support/duration"
require "active_support/core_ext/numeric/time"

require "#{dir}/monarch/core_extensions"
require "#{dir}/monarch/util"
require "#{dir}/monarch/http"
require "#{dir}/monarch/xmpp"
require "#{dir}/monarch/model"

class String
 include ActiveSupport::CoreExtensions::String::StartsEndsWith
end

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

class Numeric
  include ActiveSupport::CoreExtensions::Numeric::Time
end

Origin = Model::RemoteRepository.new

MONARCH_ASSET_PREFIX = "" unless defined?(MONARCH_ASSET_PREFIX)
Util::AssetManager.add_js_location("#{MONARCH_ASSET_PREFIX}/monarch/lib", "#{MONARCH_CLIENT_SERVER_ROOT}/lib")
Util::AssetManager.add_js_location("#{MONARCH_ASSET_PREFIX}/monarch/vendor", "#{MONARCH_CLIENT_SERVER_ROOT}/vendor")

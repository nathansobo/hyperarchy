dir = File.dirname(__FILE__)
MONARCH_ROOT = File.expand_path(File.join(dir, '..', '..'))
MONARCH_CLIENT_ROOT = File.expand_path(File.join(MONARCH_ROOT, 'client'))
MONARCH_SERVER_ROOT = File.expand_path(File.join(MONARCH_ROOT, 'server'))

require "rubygems"
require "thin"
require "sequel"
require "sequel/extensions/inflector"
require "guid"
require "json"

$:.push("#{MONARCH_SERVER_ROOT}/vendor/pusher/lib")
require "pusher"
require "active_support/ordered_hash"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/object/misc"
require "active_support/core_ext/hash/keys"
require "active_support/core_ext/hash/indifferent_access"
require "active_support/core_ext/enumerable"
require "active_support/core_ext/string/starts_ends_with"
require "active_support/duration"
require "active_support/core_ext/numeric/time"

require "#{dir}/monarch/core_extensions"
require "#{dir}/monarch/util"
require "#{dir}/monarch/http"
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
Util::AssetManager.add_js_location("#{MONARCH_ASSET_PREFIX}/monarch/lib", "#{MONARCH_CLIENT_ROOT}/lib")
Util::AssetManager.add_js_location("#{MONARCH_ASSET_PREFIX}/monarch/vendor", "#{MONARCH_CLIENT_ROOT}/vendor")

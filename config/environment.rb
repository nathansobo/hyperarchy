require "rubygems"
require "sequel"
require "guid"
require "thin"
require "erector"
require "json"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/object/metaclass"
require "active_support/core_ext/hash/keys"
require "sequel/extensions/inflector"
require "collections/sequenced_hash"

dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/..")

require "#{ROOT}/vendor/sprockets/lib/sprockets"
require "#{ROOT}/lib/core_extensions"
require "#{ROOT}/lib/model"
require "#{ROOT}/lib/server"
require "#{ROOT}/lib/dispatcher"

require "#{ROOT}/app/models"
require "#{ROOT}/app/views"
require "#{ROOT}/app/resources"


class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Origin = Model::Repository.new
Origin.connection = Sequel.sqlite
Model::GlobalDomain.create_schema

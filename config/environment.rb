dir = File.dirname(__FILE__)
ROOT = File.expand_path("#{dir}/..")

require "rubygems"
require "sequel"
require "sequel/extensions/inflector"
require "guid"
require "bcrypt"
require "thin"
require "rack/session/abstract/id"
require "erector"
require "json"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/hash/keys"
require "collections/sequenced_hash"
require "#{ROOT}/vendor/sprockets/lib/sprockets"

require "#{ROOT}/lib/core_extensions"
require "#{ROOT}/lib/model"
require "#{ROOT}/lib/http"

require "#{ROOT}/app/models"
require "#{ROOT}/app/views"
require "#{ROOT}/app/resources"

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Origin = Model::Repository.new
Origin.connection = Sequel.sqlite
Model::GlobalDomain.create_schema

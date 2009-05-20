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
require "#{ROOT}/lib/domain"
require "#{ROOT}/lib/global_domain"
require "#{ROOT}/lib/forwards_array_methods_to_tuples"
require "#{ROOT}/lib/relations"
require "#{ROOT}/lib/predicates"
require "#{ROOT}/lib/attribute"
require "#{ROOT}/lib/field"
require "#{ROOT}/lib/repository"
require "#{ROOT}/lib/tuple"
require "#{ROOT}/lib/sql_query"
require "#{ROOT}/lib/server"
require "#{ROOT}/lib/dispatcher"

require "#{ROOT}/app/models"
require "#{ROOT}/app/views"
require "#{ROOT}/app/resources"


class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Origin = Repository.new
Origin.connection = Sequel.sqlite
GlobalDomain.create_schema

require "rubygems"
require "sequel"
require "guid"
require "thin"
require "erector"
require "sprockets"
require "json"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/object/metaclass"
require "active_support/core_ext/hash/keys"
require "sequel/extensions/inflector"
require "collections/sequenced_hash"

dir = File.dirname(__FILE__)
HYPERARCHY_ROOT = File.expand_path("#{dir}/..")

require "#{dir}/hyperarchy/core_extensions"
require "#{dir}/hyperarchy/domain"
require "#{dir}/hyperarchy/global_domain"
require "#{dir}/hyperarchy/forwards_array_methods_to_tuples"
require "#{dir}/hyperarchy/relations"
require "#{dir}/hyperarchy/predicates"
require "#{dir}/hyperarchy/attribute"
require "#{dir}/hyperarchy/field"
require "#{dir}/hyperarchy/repository"
require "#{dir}/hyperarchy/tuple"
require "#{dir}/hyperarchy/models"
require "#{dir}/hyperarchy/sql_query"
require "#{dir}/hyperarchy/server"
require "#{dir}/hyperarchy/dispatcher"
require "#{dir}/hyperarchy/resources"
require "#{dir}/hyperarchy/views"

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Origin = Repository.new
Origin.connection = Sequel.sqlite
GlobalDomain.create_schema

require "rubygems"
require "sequel"
require "guid"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/object/metaclass"
require "active_support/core_ext/hash/keys"
require "sequel/extensions/inflector"
require "collections/sequenced_hash"

dir = File.dirname(__FILE__)
require "#{dir}/ce2/core_extensions"

require "#{dir}/ce2/domain"
require "#{dir}/ce2/relations"
require "#{dir}/ce2/predicates"
require "#{dir}/ce2/attribute"
require "#{dir}/ce2/field"
require "#{dir}/ce2/repository"
require "#{dir}/ce2/tuple"
require "#{dir}/ce2/models"
require "#{dir}/ce2/sql_query"

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Origin = Repository.new
Origin.connection = Sequel.sqlite
Domain.create_schema

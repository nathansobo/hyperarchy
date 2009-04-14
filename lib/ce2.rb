require "rubygems"
require "sequel"
require "guid"
require "thin"
require "erector"
require "sprockets"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/object/metaclass"
require "active_support/core_ext/hash/keys"
require "sequel/extensions/inflector"
require "collections/sequenced_hash"

dir = File.dirname(__FILE__)
CE2_ROOT = File.expand_path("#{dir}/..")

require "#{dir}/ce2/core_extensions"
require "#{dir}/ce2/domain"
require "#{dir}/ce2/global_domain"
require "#{dir}/ce2/forwards_array_methods_to_tuples"
require "#{dir}/ce2/relations"
require "#{dir}/ce2/predicates"
require "#{dir}/ce2/attribute"
require "#{dir}/ce2/field"
require "#{dir}/ce2/repository"
require "#{dir}/ce2/tuple"
require "#{dir}/ce2/models"
require "#{dir}/ce2/sql_query"
require "#{dir}/ce2/server"
require "#{dir}/ce2/dispatcher"
require "#{dir}/ce2/resources"

class Hash
  include ActiveSupport::CoreExtensions::Hash::Keys
end

Origin = Repository.new
Origin.connection = Sequel.sqlite
GlobalDomain.create_schema

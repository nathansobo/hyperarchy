require "rubygems"
require "sequel"
require "guid"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/object/metaclass"
require "sequel/extensions/inflector"
require "collections/sequenced_hash"

dir = File.dirname(__FILE__)
require "#{dir}/ce2/object"
require "#{dir}/ce2/string"

require "#{dir}/ce2/domain"
require "#{dir}/ce2/relations"
require "#{dir}/ce2/predicates"
require "#{dir}/ce2/attribute"
require "#{dir}/ce2/field"
require "#{dir}/ce2/repository"
require "#{dir}/ce2/tuple"
require "#{dir}/ce2/models"
require "#{dir}/ce2/sql_query"

Origin = Repository.new
Origin.connection = Sequel.sqlite
Origin.create_schema

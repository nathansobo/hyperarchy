require "rubygems"
require "sequel"
require "active_support/core_ext/module/delegation"
require "active_support/core_ext/object/metaclass"
require "sequel/extensions/inflector"

dir = File.dirname(__FILE__)
require "#{dir}/ce2/domain"
require "#{dir}/ce2/relations"
require "#{dir}/ce2/attribute"
require "#{dir}/ce2/field"
require "#{dir}/ce2/repository"
require "#{dir}/ce2/tuple"
require "#{dir}/ce2/models"

Origin = Repository.new
Origin.connection = Sequel.sqlite
Origin.create_schema

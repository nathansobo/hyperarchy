dir = File.dirname(__FILE__)
require "#{dir}/model/repository"
require "#{dir}/model/exposed_repository"
require "#{dir}/model/forwards_array_methods_to_records"
require "#{dir}/model/relations"
require "#{dir}/model/expressions"
require "#{dir}/model/tuples"
require "#{dir}/model/changeset"
require "#{dir}/model/signal"
require "#{dir}/model/remote_repository"
require "#{dir}/model/sql"
require "#{dir}/model/sql_generation_state"
require "#{dir}/model/invalid_record_exception"
require "#{dir}/model/user"

module Model
  class << self
    attr_accessor :convert_strings_to_keys
  end
end
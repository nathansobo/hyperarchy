require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Db < Thor
  desc "setup [env=development] [load_examples=true]", "create and migrate database for specified environment (if no environment specified, sets up development and test and loads example data)"
  def setup(env=nil, load_examples=true)
    unless env
      setup("development")
      setup("test")
      return
    end

    db.execute("drop database if exists #{db_name(env)}")
    db.execute("create database #{db_name(env)} encoding 'utf8'")
    migrate(env)
    load_examples if env == "development" && load_examples
  end

  desc "migrate [env=development]", "run migrations against the given environment"
  method_options :current => nil, :target => nil
  def migrate(env=nil)
    unless env
      migrate("development")
      migrate("test")
      return
    end
    
    Sequel.extension :migration
    migration_dir = File.expand_path("#{dir}/../migrations")

    opts = {}

    opts[:current] = options[:current].to_i if options[:current]
    opts[:target] = options[:target].to_i if options[:target]

    Sequel::IntegerMigrator.new(db(env), migration_dir, opts).run
  end

  desc "load_examples [env=development]", "load the example data into the development database"
  def load_examples(env="development")
    ENV['RACK_ENV'] = env
    require "#{dir}/../lib/hyperarchy"
    require "#{dir}/../spec/spec_helpers/examples"

    Monarch::Model.convert_strings_to_keys = true
    Monarch::Model::Repository::clear_tables
    Monarch::Model::Repository::load_fixtures(FIXTURES)
  end

  desc "console", "connect to the 'hyperarchy_development' database in mysql console"
  def console
    exec "/usr/bin/env mysql -uroot -ppassword hyperarchy_development"
  end

  private

  def db(env=nil)
    db_connections[env] ||= Sequel.postgres(db_name(env), db_options)
  end

  def db_name(env)
    env ? "hyperarchy_#{env}" : "postgres"
  end

  def db_options
    { :user => 'hyperarchy', :encoding => 'utf8' }
  end

  def db_connections
    @db_connections || {}
  end

  def dir
    File.dirname(__FILE__)
  end
end

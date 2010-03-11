require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Db < Thor
  desc "setup", "(re)create 'hyperarchy_development' database and build its schema"
  def setup
    Origin.connection = Sequel.mysql :user => 'root', :password => 'password', :host => 'localhost'
    Origin.connection.execute('drop database if exists hyperarchy_development')
    Origin.connection.execute('create database hyperarchy_development')
    Origin.connection.use('hyperarchy_development')
    Model::Repository.create_schema
  end

  desc "load_fixtures", "load the test fixtures into the development database"
  def load_fixtures
    require "#{dir}/../config/environments/development"
    require "#{dir}/../spec/spec_helpers/fixtures"
    Model::Repository::clear_tables
    Model::Repository::load_fixtures(FIXTURES)
  end

  desc "console", "connect to the 'hyperarchy_development' database in mysql console"
  def console
    exec "/usr/bin/env mysql -uroot -ppassword hyperarchy_development"
  end

  private
  def dir
    File.dirname(__FILE__)
  end
end

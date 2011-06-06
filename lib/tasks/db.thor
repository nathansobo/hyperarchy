require File.expand_path('../thor_helper', __FILE__)

class Db < Thor
  desc "create [env=development,test]", "create the database(s)"
  def create(env=nil)
    if env.nil?
      create('development')
      create('test')
      create('jasmine')
      return
    end

    system "createdb hyperarchy_#{env} --encoding utf8 --username=hyperarchy"
  end

  desc "drop [env=development,test]", "drop the database for the specified environment"
  def drop(env=nil)
    if env.nil?
      drop('development')
      drop('test')
      drop('jasmine')
      return
    end

    system "dropdb hyperarchy_#{env} --username=hyperarchy"
  end

  desc "reset [env=development,test]", "drop, create, and migrate the database for the specified environment"
  def reset(env=nil)
    if env.nil?
      reset('development')
      reset('test')
      reset('jasmine')
      return
    end

    drop(env)
    create(env)
    migrate(env)
  end

  desc "migrate [env=development,test] [--target=target]", "migrate the database, optionally to a specific version"
  method_options :target => nil
  def migrate(env=nil)
    if env.nil?
      migrate('development')
      migrate('test')
      migrate('jasmine')
      return
    end

    require 'sequel'
    require 'sequel/extensions/migration'

    target = options[:target] ? options[:target].to_i : nil
    Sequel::Migrator.run(connection(env), rails_root.join('db', 'migrate'), :target => target)
  end

  desc "transfer source_stage target_stage", "dump the contents of source's database and load them into target's database"
  def transfer(source_stage, target_stage)
    require 'deploy'
    raise "Don't transfer data to production." if target_stage.to_sym == :production
    
    source = AppServer.new(source_stage)
    target = AppServer.new(target_stage)
    target.download_database(source)
  end

  desc "download [source_stage=production]", "dump the contents of source's database and load them into the local development database"
  def download(source_stage='production')
    require 'deploy'
    source_server = AppServer.new(source_stage)
    dump_file_path = source_server.dump_database
    system "scp root@#{source_server.hostname}:#{dump_file_path} #{dump_file_path}"
    system "gunzip #{dump_file_path}"
    dump_file_path = dump_file_path.gsub(/\.gz$/, '')
    system "pg_restore #{dump_file_path} --dbname=hyperarchy_development --clean"
  end

  protected

  def configuration(env)
    require 'yaml'
    YAML.load_file(rails_root.join('config', 'database.yml'))[env]
  end

  def connection(env)
    connections[env] ||= Sequel.connect(configuration(env).merge(:logger => Logger.new($stdout)))
  end

  def connections
    @connections ||= {}
  end

  def rails_root
    @rails_root ||= Pathname.new(File.expand_path('../../..', __FILE__))
  end
end


require "#{File.dirname(__FILE__)}/ssh_client"

class DatabaseDownloader < SshClient
  def download(source_env, target_env)
    source_db_name = "hyperarchy_#{source_env}"
    target_db_name = "hyperarchy_#{target_env}"
    dump_file_name = "#{source_db_name}_#{Time.now.to_i}.tar"
    pg_dump source_db_name, "--file=/tmp/#{dump_file_name}", "--format=tar"
    local("scp hyperarchy@hyperarchy.com:/tmp/#{dump_file_name} /tmp")
    local("dropdb #{target_db_name}")
    local("createdb -T template0 #{target_db_name}")
    local("pg_restore /tmp/#{dump_file_name} --dbname=#{target_db_name}")
  end

  protected

  commands :pg_dump
end
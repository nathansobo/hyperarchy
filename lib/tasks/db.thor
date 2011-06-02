require File.expand_path('../thor_helper', __FILE__)

class Db < Thor
  desc "transfer source_stage target_stage", "dump the contents of source's database and load them into target's database"
  def transfer(source_stage, target_stage)
    source = AppServer.new(source_stage)
    target = AppServer.new(target_stage)
    target.download_database(source)
  end
end


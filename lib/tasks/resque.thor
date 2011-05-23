class ResqueTasks < Thor
  namespace :resque

  desc 'web', 'start the resque-web process with the correct configuration'
  def web
    system 'bundle exec resque-web config/resqueweb_conf.rb'
  end
end

namespace :deploy do
  desc 'Deploy the app to production'
  task :production do
    deploy('hyperarchy')
  end

  desc 'Deploy the app to staging'
  task :staging do
    deploy('hyperarchy-staging')
  end

  def deploy(app)
    Bundler.with_clean_env do
      remote = "git@heroku.com:#{app}.git"
      system "heroku maintenance:on --app #{app}"
      system "git push #{remote} master"
      system "heroku run rake db:migrate --app #{app}"
      system "heroku maintenance:off --app #{app}"
    end
  end
end

namespace :deploy do
  namespace :github do
    desc 'Deploy to GitHub production'
    task :production do
      deploy('hyperarchy')
    end

    desc 'Deploy to GitHub staging'
    task :staging do
      deploy('hyperarchy-staging')
    end
  end

  namespace :decider do
    desc 'Deploy to Decider production'
    task :production do
      deploy('decider-production')
    end

    desc 'Deploy to Decider staging'
    task :staging do
      deploy('decider-staging')
    end
  end

  def deploy(app)
    Bundler.with_clean_env do
      remote = "git@heroku.com:#{app}.git"
      system "heroku maintenance:on --app #{app}"
      system "git push -f #{remote} master"
      system "heroku run rake db:migrate --app #{app}"
      system "heroku maintenance:off --app #{app}"
    end
  end
end

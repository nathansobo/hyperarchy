config = Rails.application.config.database_configuration[Rails.env]

unless config
  $stderr.puts "Problem loading database configuration for #{Rails.env} environment"
else
  # ActiveRecord's adaptor is 'postgresql', but sequel's is Postgres
  # We're keeping ActiveRecord around in development for the migrations and rake tasks
  config['adapter'].gsub! 'postgresql', 'postgres'
  config['logger'] = Rails.logger
  Sequel.connect(config)
end

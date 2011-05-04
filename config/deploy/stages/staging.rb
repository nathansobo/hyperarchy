role :web, 'rails.hyperarchy.com'
role :app, 'rails.hyperarchy.com'
role :db,  'rails.hyperarchy.com', :primary => true
set :rails_env, 'staging'

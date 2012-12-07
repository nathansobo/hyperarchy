AUTH_SCHEME = ENV['AUTH_SCHEME'] || 'identity'

Rails.application.config.middleware.use OmniAuth::Builder do
  if AUTH_SCHEME == 'github'
    provider :github, ENV['GITHUB_KEY'], ENV['GITHUB_SECRET'], scope: "user"
  else
    provider :identity, :fields => [:full_name, :email_address]
  end
  provider :developer unless Rails.env.production?
end

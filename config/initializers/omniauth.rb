AUTH_SCHEME = ENV['AUTH_SCHEME'] || 'identity'

Rails.application.config.middleware.use OmniAuth::Builder do
  case AUTH_SCHEME
  when 'github'
    provider :github, ENV['GITHUB_KEY'], ENV['GITHUB_SECRET'], scope: "user"
  when 'google_oauth2'
    provider :google_oauth2, ENV['GOOGLE_KEY'], ENV['GOOGLE_SECRET']
  else
    provider :identity, :fields => [:full_name, :email_address]
  end
  provider :developer unless Rails.env.production?
end

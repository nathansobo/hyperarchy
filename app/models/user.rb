class User < Prequel::Record
  column :id, :integer
  column :github_uid, :integer
  column :oauth_access_token, :string
  column :email_address, :string
  column :full_name, :string
  column :avatar_url, :string

  synthetic_column :email_hash, :string

  has_many :votes
  has_many :preferences
  has_many :questions
  has_many :answers, :foreign_key => :creator_id

  validates_uniqueness_of :email_address, :message => "There is already an account with that email address."

  def self.find_or_create_with_omniauth(auth)
    return find_or_create_with_dev_credentials(auth) if auth.provider == 'developer'

    oauth_access_token = auth.credentials.token
    github_uid = auth.uid
    return unless is_github_team_member?(oauth_access_token, auth.info.nickname)

    if user = find(:github_uid => github_uid)
      user.update!(
        :oauth_access_token => oauth_access_token,
        :full_name => auth.info.name,
        :email_address => auth.info.email,
        :avatar_url => auth.info.image,
      )
      user
    else
      create!(
        :github_uid => github_uid,
        :oauth_access_token => oauth_access_token,
        :full_name => auth.info.name,
        :email_address => auth.info.email,
        :avatar_url => auth.info.image,
      )
    end
  end

  def self.is_github_team_member?(oauth_access_token, github_username)
    github = Github.new(:oauth_token => oauth_access_token)
    github.orgs.teams.team_member? ENV['GITHUB_TEAM_ID'], github_username
  end

  def self.find_or_create_with_dev_credentials(auth)
    require 'digest/md5'
    email_digest = Digest::MD5.hexdigest(auth.info.email)
    avatar_url = "http://unicornify.appspot.com/avatar/#{email_digest}?s=128"

    if user = find(:email_address => auth.info.email)
      user.update!(
        :full_name => auth.info.name,
        :avatar_url => avatar_url
      )
    else
      create!(
        :full_name => auth.info.name,
        :email_address => auth.info.email,
        :avatar_url => avatar_url
      )
    end
  end

  def can_update_or_destroy?
    current_user == self
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:full_name, :email_address, :password]
  end

  def update_whitelist
    [:full_name, :email_address, :password]
  end

  # dont send email address to another user unless they are an admin or owner
  def read_blacklist
    [:oauth_access_token]
  end

  def initial_repository_contents
    [self]
  end

  def email_hash
    Digest::MD5.hexdigest(email_address.downcase) if email_address
  end
end

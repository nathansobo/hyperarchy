class User < Prequel::Record
  column :id, :integer
  column :uid, :string
  column :provider, :string
  column :oauth_access_token, :string
  column :email_address, :string
  column :full_name, :string
  column :avatar_url, :string
  column :superuser, :boolean
  column :superuser_enabled, :boolean

  synthetic_column :email_hash, :string

  has_many :memberships
  has_many :rankings
  has_many :preferences
  has_many :questions
  has_many :question_permissions
  has_many :answers, :foreign_key => :creator_id

  def self.from_omniauth(auth)
    provider = auth.provider
    uid = auth.uid
    email_address = auth.info.email

    attributes = {
      :provider => provider,
      :uid => uid,
      :full_name => auth.info.name,
      :email_address => email_address,
      :avatar_url => auth.info.image || unicorn_avatar_for_email_address(email_address),
    }

    if provider == 'github'
      oauth_access_token = auth.credentials.token
      return unless is_github_team_member?(oauth_access_token, auth.info.nickname)
      attributes[:oauth_access_token] = oauth_access_token
    end

    if user = find(:provider => provider, :uid => uid)
      user.update!(attributes)
    else
      user = create!(attributes)
    end

    if provider == 'google_oauth2' && domain = auth.extra.raw_info.hd
      group = Group.find_or_create!(:domain => domain)
    elsif provider == 'github'
      group = Group.find_or_create!(:domain => 'github.com')
      group.update!(:name => 'GitHub')
    end
    group.add_member(user) if group

    user
  end

  def self.is_github_team_member?(oauth_access_token, github_username)
    github = Github.new(:oauth_token => oauth_access_token)
    github.orgs.teams.team_member? ENV['GITHUB_TEAM_ID'], github_username
  end

  def self.unicorn_avatar_for_email_address(email_address)
    require 'digest/md5'
    email_digest = Digest::MD5.hexdigest(email_address)
    avatar_url = "https://secure.gravatar.com/avatar/#{email_digest}"
  end

  def self.find_or_create_with_dev_credentials(auth)
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

  def broadcast_channels
    groups.map(&:broadcast_channels).flatten
  end

  def private_broadcast_channels
    [private_channel_name]
  end

  def private_channel_name
    "private-user-#{id}"
  end

  def visible_memberships
    if superuser_enabled?
      Membership.table
    else
      visible_groups.join_through(Membership)
    end
  end

  def visible_users
    if superuser_enabled?
      User.table
    else
      visible_memberships.join_through(User) |
        private_questions.join_through(QuestionPermission).join_through(User)
    end
  end

  def groups
    @groups ||= memberships.join_through(Group)
  end

  def visible_groups
    if superuser_enabled?
      Group.table
    else
      groups
    end
  end

  def initial_dataset
    [self, groups, memberships]
  end

  def visible_questions
    if superuser_enabled?
      Question.table
    else
      private_questions | group_questions
    end
  end

  def group_questions
    @group_questions ||= groups.join_through(Question).where(:visibility => 'group')
  end

  def private_questions
    @private_questions ||= question_permissions.join_through(Question)
  end

  def visible_answers
    @visible_answers ||= visible_questions.join_through(Answer)
  end

  def visible_rankings
    @visible_rankings ||= visible_questions.join_through(Ranking)
  end

  def visible_preferences
    @visible_preferences ||= visible_questions.join_through(Preference)
  end

  def visible_question_comments
    @visible_question_comments ||= visible_questions.join_through(QuestionComment)
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
    list = [:full_name, :email_address, :password]
    list.push(:superuser, :superuser_enabled) if current_user.superuser?
    list
  end

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

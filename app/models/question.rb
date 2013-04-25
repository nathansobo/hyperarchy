class Question < Prequel::Record
  column :id, :integer
  column :secret, :string
  column :creator_id, :integer
  column :body, :string
  column :group_id, :integer
  column :visibility, :string, :default => 'group'
  column :archived_at, :datetime
  column :ranking_count, :integer, :default => 0
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :group
  has_many :answers
  has_many :rankings
  has_many :preferences
  has_many :majorities
  has_many :comments, :class_name => "QuestionComment"
  has_many :question_permissions

  belongs_to :creator, :class_name => "User"

  def self.generate_secret
    secret = generate_random_string
    Question.find(:secret => secret) ? generate_secret : secret
  end

  def self.generate_random_string
    (0...8).map { (97 + rand(26)).chr }.join
  end

  validates_presence_of :body

  def can_update_or_destroy?
    creator_id == current_user.id
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:body, :group_id, :visibility]
  end

  def update_whitelist
    if archived?
      [:archived_at, :group_id, :visibility]
    else
      [:body, :group_id, :visibility, :archived_at]
    end
  end

  def before_create
    ensure_body_within_limit
    self.secret ||= self.class.generate_secret if private?
    self.creator ||= current_user
  end

  def after_create
    QuestionPermission.create!(secret: secret) if private?
    send_notification_emails unless private?
  end

  def broadcast_channels
    if private?
      permitted_users.map(&:private_broadcast_channels).flatten
    else
      group ? group.broadcast_channels : []
    end
  end

  def to_param
    private?? secret : id.to_s
  end

  def client_data
    [User.table, self, answers, preferences, rankings, comments]
  end

  def permitted_users
    @permitted_users ||= question_permissions.join_through(User)
  end

  def archived?
    !!archived_at
  end

  def private?
    visibility == 'private'
  end

  def ensure_body_within_limit
    raise SecurityError, "Body exceeds 140 characters" if body.length > 140
  end

  def before_update(changeset)
    ensure_body_within_limit if changeset[:body]
  end

  def before_destroy
    answers.each(&:destroy)
  end

  def compute_global_ranking
    already_processed = []
    graph = RGL::DirectedAdjacencyGraph.new

    majorities.order_by(Majority[:pro_count].desc, Majority[:con_count].asc, Majority[:winner_created_at].asc).each do |majority|
      winner_id = majority.winner_id
      loser_id = majority.loser_id
      next if already_processed.include?([loser_id, winner_id])
      already_processed.push([winner_id, loser_id])
      graph.add_edge(winner_id, loser_id)
      graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
    end

    graph.topsort_iterator.each_with_index do |answer_id, index|
      answer = answers.find(answer_id)
      answer.update!(:position => index + 1)
    end

    update!(:updated_at => Time.now)
  end

  def positive_preferences
    preferences.where(Preference[:position].gt(0))
  end

  def negative_preferences
    preferences.where(Preference[:position].lt(0))
  end

  def positive_answer_preference_counts
    times_each_answer_is_ranked(positive_preferences)
  end

  def negative_answer_preference_counts
    times_each_answer_is_ranked(negative_preferences)
  end

  def times_each_answer_is_ranked(relation)
    relation.
      group_by(:answer_id).
      project(:answer_id, Preference[:id].count.as(:times_ranked))
  end

  def ranked_answers
    answers.
      join(preferences).
      project(Answer)
  end

  def extra_records_for_create_events
    [creator]
  end

  def url
    "#{APP_URL}/questions/#{to_param}"
  end

  def send_notification_emails
    recipients = group.members.all
    from = "#{APP_NAME} <notifications@#{APP_DOMAIN}>"
    subject = "#{creator.full_name} asks: #{body}"
    text = render_template('emails/new_question.text.erb', :question_body => body, :question_url => url)
    html = render_template('emails/new_question.html.erb', :question_body => body, :question_url => url)
    $thread_pool.process do
      recipients.each do |recipient|
        next if recipient.email_address.blank?

        RestClient.post("#{MAILGUN_URL}/messages",
          :from => from,
          :to => "#{recipient.full_name} <#{recipient.email_address}>",
          :subject => subject,
          :text => text,
          :html => html
        )
      end
    end
  end
end

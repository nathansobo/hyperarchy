class Election < Monarch::Model::Record
  column :organization_id, :key
  column :creator_id, :key
  column :body, :string
  column :vote_count, :integer, :default => 0
  column :created_at, :datetime
  column :updated_at, :datetime

  has_many :candidates
  has_many :votes
  has_many :rankings
  has_many :majorities

  belongs_to :creator, :class_name => "User"
  belongs_to :organization

  attr_accessor :suppress_notification_email

  def can_create?
    current_user.admin? || organization.has_member?(current_user)
  end

  def can_update_or_destroy?
    current_user.admin? || creator_id == current_user.id || organization.has_owner?(current_user)
  end
  alias can_update? can_update_or_destroy?
  alias can_destroy? can_update_or_destroy?

  def create_whitelist
    [:organization_id, :body]
  end

  def update_whitelist
    [:body]
  end

  def organization_ids
    [organization_id]
  end

  def before_create
    self.creator ||= current_user
  end

  def after_create
    return if suppress_notification_email
    notify_users = organization.memberships.
      where(:notify_of_new_elections => true).
      where(Membership[:user_id].neq(creator_id)).
      join_through(User)

    unless notify_users.empty?
      to_addresses = notify_users.map(&:email_address)
      subject = email_subject
      body = email_body

      Hyperarchy.defer do
        to_addresses.each do |to_address|
          Mailer.send(:to => to_address, :subject => subject, :body => body)
        end
      end
    end
  end

  def email_subject
    "There's a new question on Hyperarchy"
  end

  def email_body
    "#{creator.full_name} added a new question to #{organization.name}.

\"#{body}\"

To view this question in Hyperarchy, visit this link:
#{Mailer.base_url}/app#view=election&electionId=#{id}

To unsubscribe from these emails, adjust your email preferences at:
#{Mailer.base_url}/app#view=account

Or just reply with 'unsubscribe' to this email.
"
  end

  def before_destroy
    candidates.each do |candidate|
      candidate.destroy
    end
  end

  def compute_global_ranking
    puts "compute_global_ranking"
    already_processed = []
    graph = RGL::DirectedAdjacencyGraph.new

    majorities.order_by(Majority[:pro_count].desc, Majority[:con_count].asc).each do |majority|
      winner_id = majority.winner_id
      loser_id = majority.loser_id
      next if already_processed.include?([loser_id, winner_id])
      already_processed.push([winner_id, loser_id])
      graph.add_edge(winner_id, loser_id)
      graph.remove_edge(winner_id, loser_id) unless graph.acyclic?
    end

    graph.topsort_iterator.each_with_index do |candidate_id, index|
      candidate = candidates.find(candidate_id)
      puts "updating #{candidate.body.inspect} from #{candidate.position} to #{index}"
      candidate.update!(:position => index + 1)
    end

    update!(:updated_at => Time.now)
  end

  def positive_rankings
    rankings.where(Ranking[:position] > 0)
  end

  def negative_rankings
    rankings.where(Ranking[:position] < 0)
  end

  def positive_candidate_ranking_counts
    times_each_candidate_is_ranked(positive_rankings)
  end

  def negative_candidate_ranking_counts
    times_each_candidate_is_ranked(negative_rankings)
  end

  def times_each_candidate_is_ranked(relation)
    relation.
      group_by(:candidate_id).
      project(:candidate_id, Ranking[:id].count.as(:times_ranked))
  end

  def ranked_candidates
    candidates.
      join_to(rankings).
      project(Candidate)
  end
end

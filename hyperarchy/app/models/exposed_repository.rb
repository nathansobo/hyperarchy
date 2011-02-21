class ExposedRepository < Monarch::Model::ExposedRepository
  attr_reader :user
  def initialize(user)
    @user = user
  end

  expose :organizations do
    if user.admin?
      Organization.table
    else
      union(user.organizations, Organization.where(Organization[:privacy].neq("private")))
    end
  end

  expose :memberships do
    Membership.table
  end

  expose :users do
    User.table
  end

  expose :elections do
    organizations.join_through(Election)
  end

  expose :candidates do
    elections.join_through(Candidate)
  end

  expose :votes do
    elections.join_through(Vote)
  end

  expose :election_visits do
    user.election_visits
  end

  expose :rankings do
    elections.join_through(Ranking)
  end

  expose :candidate_comments do
    candidates.join_through(CandidateComment)
  end

  def subscribe(*args)
    # subscribe is disabled for now in favor of the custom SubscriptionManager
    raise Monarch::Unauthorized
  end
end

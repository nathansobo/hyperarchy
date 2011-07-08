class Sandbox < Prequel::Sandbox
  attr_reader :user
  def initialize(user)
    @user = user
  end

  expose :organizations do
    if user.admin?
      Organization.table
    else
      user.organizations | Organization.where(Organization[:privacy].neq("private"))
    end
  end

  expose :memberships do
    Membership.table
  end

  expose :users do
    User.table
  end

  expose :questions do
    organizations.join_through(Question)
  end

  expose :question_comments do
    questions.join_through(QuestionComment)
  end

  expose :candidates do
    questions.join_through(Candidate)
  end

  expose :votes do
    questions.join_through(Vote)
  end

  expose :question_visits do
    user.question_visits
  end

  expose :rankings do
    questions.join_through(Ranking)
  end

  expose :candidate_comments do
    candidates.join_through(CandidateComment)
  end

  def subscribe(*args)
    # subscribe is disabled for now in favor of the custom SubscriptionManager
    raise SecurityError
  end
end

class Sandbox < Prequel::Sandbox
  attr_reader :user
  def initialize(user)
    @user = user
  end

  expose :groups do
    user.superuser_enabled?? Group.table : user.groups
  end

  expose :memberships do
    user.superuser_enabled?? Membership.table : user.memberships
  end

  expose :users do
    User.table
  end

  expose :questions do
    user.visible_questions
  end

  expose :question_permissions do
    user.superuser_enabled?? QuestionPermission.table : user.question_permissions
  end

  expose :answers do
    Answer.table
  end

  expose :rankings do
    Ranking.table
  end

  expose :preferences do
    Preference.table
  end

  expose :question_comments do
    QuestionComment.table
  end
end

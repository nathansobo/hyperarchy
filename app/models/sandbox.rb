class Sandbox < Prequel::Sandbox
  attr_reader :user
  def initialize(user)
    @user = user
  end

  expose :groups do
    user.visible_groups
  end

  expose :memberships do
    user.visible_memberships
  end

  expose :users do
    User.table
  end

  expose :questions do
    user.visible_questions
  end

  expose :answers do
    user.visible_answers
  end

  expose :rankings do
    user.visible_rankings
  end

  expose :preferences do
    user.visible_preferences
  end

  expose :question_comments do
    user.visible_question_comments
  end
end

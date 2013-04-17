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

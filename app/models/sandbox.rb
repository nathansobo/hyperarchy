class Sandbox < Prequel::Sandbox
  attr_reader :user
  def initialize(user)
    @user = user
  end

  expose :User do
    User.table
  end

  expose :Question do
    Question.table
  end

  expose :Answer do
    Answer.table
  end

  expose :Vote do
    Vote.table
  end

  expose :Ranking do
    Ranking.table
  end
end

class QuestionPermission < Prequel::Record
  column :id, :integer
  column :secret, :string
  column :question_id, :integer
  column :user_id, :integer

  belongs_to :question
  belongs_to :user

  validates_presence_of :question_id

  def after_initialize
    self.question = Question.find(:secret => secret)
    self.user = current_user
  end

  def create_whitelist
    [:secret]
  end

  def can_update?
    false
  end
end

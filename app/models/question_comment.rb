class QuestionComment < Prequel::Record
  column :id, :integer
  column :question_id, :integer
  column :creator_id, :integer
  column :body, :string
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :creator, :class_name => "User"
  belongs_to :question

  validates_presence_of :body

  def before_create
    self.creator = current_user
  end
end

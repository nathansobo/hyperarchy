class QuestionVisit < Prequel::Record
  column :id, :integer
  column :question_id, :integer
  column :user_id, :integer
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :question
  belongs_to :user

  def organization_ids
    question ? question.organization_ids : []
  end
end

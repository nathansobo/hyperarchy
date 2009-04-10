class Question < Tuple
  attribute :stimulus, :string
  attribute :position, :integer
  attribute :supporting_statements, :string
  attribute :image, :string
  attribute :question_set_id, :string
  attribute :explanation, :string
  attribute :name, :string
  attribute :source_info, :string
  attribute :experience_points, :integer
  attribute :deleted_at, :datetime
  attribute :published_at, :datetime
  attribute :spr, :boolean

  # belongs_to :qusetion_set
  relates_to_one :question_set do
    QuestionSet.where(QuestionSet.id.eq(question_set_id))
  end

  # has_many :answers
  relates_to_many :answers do
    Answer.where(Answer.question_id.eq(id))
  end
end
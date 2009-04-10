class QuestionSet < Tuple
  attribute :name, :string
  attribute :info, :string
  attribute :explanation, :string
  attribute :position, :integer
  attribute :subtrack_id, :string
  attribute :fixed_info_width, :boolean
  attribute :deleted_at, :datetime
  attribute :published_at, :datetime

  # has_many :questions
  relates_to_many :questions do
    Question.where(Question.question_set_id.eq(id))
  end
end
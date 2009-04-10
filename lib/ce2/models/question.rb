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

  relates_to_many :answers do
    Answer.where(Answer.question_id.eq(id))
  end

#  belongs_to :qusetion_set
#  has_many :answers
end
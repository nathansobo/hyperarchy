class QuestionSet < Tuple
  attribute :name, :string
  attribute :info, :string
  attribute :explanation, :string
  attribute :position, :integer
  attribute :subtrack_id, :string
  attribute :fixed_info_width :boolean
  attribute :deleted_at, :datetime
  attribute :published_at, :datetime

  belongs_to :subtrack
  has_many :questions
end
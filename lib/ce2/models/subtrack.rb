class Subtrack < Tuple
  attribute :answer_mode_timeout, :integer
  attribute :review_mode_timeout, :integer
  attribute :published_at, :datetime
  attribute :deleted_at, :datetime
  attribute :track_id, :string

  belongs_to :track
  has_many :question_sets
end
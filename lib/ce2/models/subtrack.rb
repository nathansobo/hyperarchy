class Subtrack < Tuple
  attribute :answer_mode_timeout, :integer
  attribute :review_mode_timeout, :integer
  attribute :published_at, :datetime
  attribute :deleted_at, :datetime
  attribute :track_id, :string

  # belongs_to :track
  relates_to_one :track do
    Track.where(Track.id.eq(track_id))
  end

  # has_many :question_sets
  relates_to_many :question_sets do
    QuestionSet.where(QuestionSet.subtrack_id.eq(id))
  end
end
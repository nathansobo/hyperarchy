class Group < Tuple
  attribute :name, :string
  attribute :description, :string

#  has_many :tracks
  relates_to_many :tracks do
    Track.where(Track.group_id.eq(id))
  end

  # has_many :subtracks, :through => :tracks
  relates_to_many :subtracks do
    tracks.join(Subtrack).on(Subtrack.track_id.eq(Track.id)).project(Subtrack)
  end

  # has_many :question_sets, :through => :subtracks
  relates_to_many :question_sets do
    subtracks.join(QuestionSet).on(QuestionSet.subtrack_id.eq(Subtrack.id)).project(QuestionSet)
  end

  # has_many :questions, :through => :question_sets
  relates_to_many :questions do
    question_sets.join(Question).on(Question.question_set_id.eq(QuestionSet.id)).project(Question)
  end

  # has_many :answers, :through => :questions
  relates_to_many :answers do
    questions.join(Answer).on(Answer.question_id.eq(Question.id)).project(Answer)
  end
end
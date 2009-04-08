class Answer < Tuple
  attribute :body, :string
  attribute :question_id, :string
  attribute :correct, :boolean

#  belongs_to :question
end
class Group < June::Tuple
  attribute :name, :string
  attribute :description, :string

  has_many :tracks
end
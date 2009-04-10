class Group < Tuple
  attribute :name, :string
  attribute :description, :string

  # has_many :tracks
  relates_to_many :tracks do
    Track.where(Track.group_id.eq(id))
  end
end
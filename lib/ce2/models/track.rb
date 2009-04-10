class Track < Tuple
  attribute :name, :string
  attribute :maximum_users, :integer
  attribute :group_id, :string
  attribute :published_at, :datetime
  attribute :deleted_at, :datetime

  # belongs_to :group
  relates_to_one :group do
    Group.where(Group.id.eq(group_id))
  end

  # has_many :subtracks
  relates_to_many :subtracks do
    Subtrack.where(Subtrack.track_id.eq(id))
  end
end
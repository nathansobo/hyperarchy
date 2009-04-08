class Track < June::Tuple
  attribute :name, :string
  attribute :maximum_users, :integer
  attribute :group_id, :string
  attribute :published_at, :datetime
  attribute :deleted_at, :datetime

  belongs_to :group
  has_many :subtracks
end
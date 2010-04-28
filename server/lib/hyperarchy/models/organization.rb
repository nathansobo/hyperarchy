class Organization < Monarch::Model::Record
  column :name, :string

  has_many :elections
end

class Organization < Model::Record
  column :name, :string

  has_many :elections
end

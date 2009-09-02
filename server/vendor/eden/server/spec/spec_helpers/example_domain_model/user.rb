class User < Model::Tuple
  column :full_name, :string
  column :email_address, :string

  relates_to_many :elections do
    Election.set
  end

  relates_to_many :candidates do
    Candidate.set
  end
end

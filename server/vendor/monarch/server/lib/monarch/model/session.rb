class Session < Model::Record
  column :session_id, :string
  column :user_id, :string

  belongs_to :user

  def before_create
    self.session_id = Guid.new.to_s
  end
end

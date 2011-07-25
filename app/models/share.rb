class Share < Prequel::Record
  column :id, :integer
  column :code, :string
  column :service, :string
  column :user_id, :integer
  column :question_id, :integer
  column :created_at, :datetime

  belongs_to :user
  belongs_to :question

  def before_create
    raise "Service must be twitter or facebook" unless service =~ /^(twitter|facebook)$/
    self.user = current_user
  end
end
#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

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
    self.user_id ||= current_user.id
  end
end
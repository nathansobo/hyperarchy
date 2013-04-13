class AddGithubGroupForGithubMode < ActiveRecord::Migration
  def up
    return unless ENV['AUTH_SCHEME'] == 'github' && ENV['APP_MODE'] == 'private'

    group_id = Prequel::DB[:groups].insert(
      :domain => "github.com",
      :name => "GitHub",
      :created_at => Time.now,
      :updated_at => Time.now
    )
    Prequel::DB[:users].each do |user|
      user_id = user[:id]
      Prequel::DB[:memberships].insert(
        :user_id => user_id,
        :group_id => group_id,
        :created_at => Time.now,
        :updated_at => Time.now
      )
    end
    Prequel::DB[:questions].update(:group_id => group_id)
  end

  def down
  end
end

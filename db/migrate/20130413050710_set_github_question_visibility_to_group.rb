class SetGithubQuestionVisibilityToGroup < ActiveRecord::Migration
  def up
    return unless ENV['AUTH_SCHEME'] == 'github' && ENV['APP_MODE'] == 'private'
    Prequel::DB[:questions].update(:visibility => 'group')
  end

  def down
  end
end

class AddVisibilityToQuestions < ActiveRecord::Migration
  def change
    add_column :questions, :visibility, :string
    add_column :questions, :group_id, :integer
  end
end

class AddStateToQuestions < ActiveRecord::Migration
  def change
    add_column :questions, :state, :string
  end
end

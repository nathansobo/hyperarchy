Sequel.migration do

  up do
    add_column :candidates, :comment_count, Integer, :default => 0

    self[:candidates].each do |candidate|
      comment_count = self[:candidate_comments].filter(:candidate_id => candidate[:id]).count
      self[:candidates].filter(:id => candidate[:id]).update(:comment_count => comment_count)
    end
  end

  down do
    drop_column :candidates, :comment_count
  end
end


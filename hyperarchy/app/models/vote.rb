class Vote < Prequel::Record
  column :id, :integer
  column :user_id, :key
  column :election_id, :key
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :user
  belongs_to :election

  def can_mutate?
    false
  end
  alias can_create? can_mutate?
  alias can_update? can_mutate?
  alias can_destroy? can_mutate?

  def organization_ids
    election ? election.organization_ids : []
  end

  # note: this approach to incrementing / decrementing is not atomic!
  # but currently plan to serialize all operations per election so it's ok
  # we want to go through the record so the update gets broadcast
  def after_create
    election.vote_count = election.vote_count + 1
    election.save
  end

  def after_destroy
    election.vote_count -= 1
    election.save
  end

  def updated
    update(:updated_at => Time.now)
  end
end
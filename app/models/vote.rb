#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class Vote < Prequel::Record
  column :id, :integer
  column :user_id, :integer
  column :question_id, :integer
  column :created_at, :datetime
  column :updated_at, :datetime

  belongs_to :user
  belongs_to :question

  def can_mutate?
    false
  end
  alias can_create? can_mutate?
  alias can_update? can_mutate?
  alias can_destroy? can_mutate?

  def organization_ids
    question ? question.organization_ids : []
  end

  # note: this approach to incrementing / decrementing is not atomic!
  # but currently plan to serialize all operations per question so it's ok
  # we want to go through the record so the update gets broadcast
  def after_create
    question.vote_count = question.vote_count + 1
    question.save
  end

  def after_destroy
    question.vote_count -= 1
    question.save
  end

  def updated
    update(:updated_at => Time.now)
  end

  def extra_records_for_create_events
    [user]
  end
end
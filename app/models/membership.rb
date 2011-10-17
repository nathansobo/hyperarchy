#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class Membership < Prequel::Record
  column :id, :integer
  column :organization_id, :integer
  column :user_id, :integer
  column :role, :string, :default => "member"
  column :last_visited, :datetime
  column :notify_of_new_questions, :string, :default => "daily"
  column :notify_of_new_answers, :string, :default => "daily"
  column :notify_of_new_comments_on_own_answers, :string, :default => "daily"
  column :notify_of_new_comments_on_ranked_answers, :string, :default => "daily"
  column :created_at, :datetime
  column :updated_at, :datetime

  synthetic_column :first_name, :string
  synthetic_column :last_name, :string
  synthetic_column :email_address, :string

  belongs_to :organization
  belongs_to :user

  attr_writer :email_address, :first_name, :last_name
  delegate :email_address, :first_name, :last_name, :to => :user

  def current_user_is_admin_or_organization_owner?
    current_user.admin? || organization.has_owner?(current_user)
  end
  alias can_create? current_user_is_admin_or_organization_owner?
  alias can_destroy? current_user_is_admin_or_organization_owner?

  def can_update?
    current_user_is_admin_or_organization_owner? || user == current_user
  end

  def create_whitelist
    [:organization_id, :user_id, :role, :first_name, :last_name, :email_address,
     :notify_of_new_questions, :notify_of_new_answers,
     :notify_of_new_comments_on_ranked_answers,
     :notify_of_new_comments_on_own_answers]
  end

  def update_whitelist
    if current_user_is_admin_or_organization_owner?
      [:first_name, :last_name, :role, :last_visited,
       :notify_of_new_questions, :notify_of_new_answers,
       :notify_of_new_comments_on_ranked_answers,
       :notify_of_new_comments_on_own_answers]
    else
      [:last_visited, :notify_of_new_questions, :notify_of_new_answers,
       :notify_of_new_comments_on_ranked_answers,
       :notify_of_new_comments_on_own_answers]
    end
  end

  # dont send email address to another user unless they are an admin or owner
  def read_blacklist
    if current_user_can_read_email_address?
      super
    else
      [:email_address]
    end
  end

  def current_user_can_read_email_address?
    return false unless current_user
    user == current_user || current_user.admin? || organization.current_user_is_owner?
  end

  def organization_ids
    [organization_id]
  end

  def email_address
    @email_address || (user ? user.email_address : nil)
  end

  def first_name
    @first_name || (user ? user.first_name : nil)
  end

  def last_name
    @last_name || (user ? user.last_name : nil)
  end

  def before_create
    self.last_visited = Time.now

    if user = User.find(:email_address => email_address)
      self.user = user
    end
  end

  def wants_notifications?(period)
     wants_question_notifications?(period) ||
       wants_answer_notifications?(period) ||
       wants_ranked_answer_comment_notifications?(period) ||
       wants_own_answer_comment_notifications?(period)

  end

  def wants_answer_notifications?(period)
    notify_of_new_answers == period
  end

  def wants_question_notifications?(period)
    notify_of_new_questions == period
  end

  def wants_ranked_answer_comment_notifications?(period)
    notify_of_new_comments_on_ranked_answers == period
  end

  def wants_own_answer_comment_notifications?(period)
    notify_of_new_comments_on_own_answers == period
  end

  def new_questions_in_period(period)
    organization.questions.
      where(Question[:created_at].gt(last_notified_or_visited_at(period))).
      where(Question[:creator_id].neq(user_id))
  end

  def new_answers_in_period(period)
    user.votes.
      join(organization.questions).
      join_through(Answer).
      where(Answer[:created_at].gt(last_notified_or_visited_at(period))).
      where(Answer[:creator_id].neq(user_id))
  end

  def new_comments_on_ranked_answers_in_period(period)
    organization.questions.
      join(user.rankings).
      join(Answer, Ranking[:answer_id] => Answer[:id]).
      where(Answer[:creator_id].neq(user_id)).
      join_through(AnswerComment).
      where(AnswerComment[:created_at].gt(last_notified_or_visited_at(period))).
      where(AnswerComment[:creator_id].neq(user_id))
  end

  def new_comments_on_own_answers_in_period(period)
    organization.questions.
      join(user.answers).
      join_through(AnswerComment).
      where(AnswerComment[:created_at].gt((last_notified_or_visited_at(period)))).
      where(AnswerComment[:creator_id].neq(user_id))
  end

  protected

  # returns the time of last visit or the 1 <period> ago, whichever is more recent
  def last_notified_or_visited_at(period)
    [period_ago(period), last_visited].compact.max
  end

  def period_ago(period)
    case period
      when "every5"
        1.minute.ago
      when "hourly"
        1.hour.ago
      when "daily"
        1.day.ago
      when "weekly"
        1.week.ago
    end
  end
end

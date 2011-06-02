Sham.define do
  first_name { Faker::Name.first_name }
  last_name { Faker::Name.last_name }
  email_address { Faker::Internet.email }
  question { Faker::Lorem.sentence.chop + "?" }
  answer { Faker::Lorem.sentence }
  organization_description { Faker::Company.bs.capitalize + "." }
  organization_name { Faker::Company.name }
end

User.blueprint do
  first_name
  last_name
  email_address
  password { "password" }
end

Election.blueprint do
  body { Sham.question }
  organization { Organization.make }
  suppress_immediate_notifications { true }
  suppress_current_user_membership_check { true }
end

Candidate.blueprint do
  election { Election.make }
  body { Sham.answer }
  suppress_immediate_notifications { true }
  suppress_current_user_membership_check { true }
end

CandidateComment.blueprint do
  candidate { Candidate.make }
  body { Faker::Lorem.sentence }
  suppress_immediate_notifications { true }
  suppress_current_user_membership_check { true }
end

Organization.class_eval do
  blueprint do
    suppress_membership_creation { true }
    name { Sham.organization_name }
    description { Sham.organization_description }
  end

  def make_member(attributes={})
    User.make(attributes).tap do |user|
      memberships.create!(:user => user)
    end
  end

  def make_owner(attributes={})
    User.make(attributes).tap do |user|
      memberships.create!(
        :user => user,
        :role => "owner",
      )
    end
  end
end

Membership.class_eval do
  blueprint do
    user { User.make }
    organization { Organization.make }
  end

  attr_accessor :all_notifications

  def before_save
    return unless all_notifications
    self.notify_of_new_elections = all_notifications
    self.notify_of_new_candidates = all_notifications
    self.notify_of_new_comments_on_own_candidates = all_notifications
    self.notify_of_new_comments_on_ranked_candidates = all_notifications
  end
end


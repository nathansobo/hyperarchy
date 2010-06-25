Sham.define do
  first_name { Faker::Name.first_name }
  last_name { Faker::Name.last_name }
  email_address { Faker::Internet.email }
  question { Faker::Lorem.sentence.chop + "?" }
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
end

Organization.blueprint do
  suppress_membership_creation { true }
  name { Sham.organization_name }
  description { Sham.organization_description }
end

Membership.blueprint do
  organization { Organization.make }
  suppress_invite_email { true }
end
Sham.define do
  question { Faker::Lorem.sentence.chop + "?" }
  organization_description { Faker::Company.bs.capitalize + "." }
  organization_name { Faker::Company.name }
end

Election.blueprint do
  body { Sham.question }
  organization { Organization.make(:suppress_membership_creation => true) }
end

Organization.blueprint do
  name { Sham.organization_name }
  description { Sham.organization_description }
end
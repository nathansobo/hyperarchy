require "prequel/machinist_adaptor"

Group.blueprint do
  name { Faker::Company.name }
  domain { Faker::Internet.domain_name }
end

User.blueprint do
  full_name { Faker::Name.name }
  email_address { Faker::Internet.email }
end

Question.blueprint do
  body {  Faker::Lorem.sentence.chop + "?" }
end

Answer.blueprint do
  question_id { Question.make!.id }
  body { Faker::Lorem.sentence.chop }
end

Preference.blueprint do
end

Ranking.blueprint do
end

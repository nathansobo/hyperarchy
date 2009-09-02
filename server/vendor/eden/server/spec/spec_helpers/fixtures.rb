require "#{File.dirname(__FILE__)}/example_domain_model"

User.fixtures(
  :nathan => {
    :full_name => "nathan"  
  }
)

Election.fixtures(
  :grain => {
    :body => "What's your favorite grain?"
  },
  :vegetable => {
   :body => "What's your favorite vegetable?"
  }
)

Candidate.fixtures(
  :grain_quinoa => {
    :body => "Quinoa",
    :election_id => "grain"
  },
  :grain_barley => {
    :body => "Barley",
    :election_id => "grain"
  },
  :grain_millet => {
    :body => "Millet",
    :election_id => "grain"
  },
  :vegetable_daikon => {
    :body => "Daikon",
    :election_id => "vegetable"
  },
  :vegetable_kale => {
    :body => "Kale",
    :election_id => "vegetable"
  }
)

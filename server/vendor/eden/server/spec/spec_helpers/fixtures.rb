require "#{File.dirname(__FILE__)}/example_domain_model"

User.fixtures(
  :nathan => {
    :full_name => "nathan"  
  }
)

Blog.fixtures(
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
    :blog_id => "grain"
  },
  :grain_barley => {
    :body => "Barley",
    :blog_id => "grain"
  },
  :grain_millet => {
    :body => "Millet",
    :blog_id => "grain"
  },
  :vegetable_daikon => {
    :body => "Daikon",
    :blog_id => "vegetable"
  },
  :vegetable_kale => {
    :body => "Kale",
    :blog_id => "vegetable"
  }
)

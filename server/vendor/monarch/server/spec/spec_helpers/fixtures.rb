require "#{File.dirname(__FILE__)}/example_domain_model"

User.fixtures(
  :jan => {
    :full_name => "Jan Nelson"  
  }
)

Blog.fixtures(
  :grain => {
    :title => "All about grain"
  },
  :vegetable => {
    :title => "All about vegetables"
  }
)

BlogPost.fixtures(
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

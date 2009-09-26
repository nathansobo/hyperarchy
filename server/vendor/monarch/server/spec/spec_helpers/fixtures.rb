require "#{File.dirname(__FILE__)}/example_domain_model"

FIXTURES = {
  :users => {
    :jan => {
      :full_name => "Jan Nelson",
      :age => 31,
      :signed_up_at => 1253740028201
    }
  },

  :blogs => {
    :grain => {
      :title => "All about grain"
    },
    :vegetable => {
      :title => "All about vegetables"
    }
  },

  :blog_posts => {
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
  }
}

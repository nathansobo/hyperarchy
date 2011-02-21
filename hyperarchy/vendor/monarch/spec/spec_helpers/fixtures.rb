require "#{File.dirname(__FILE__)}/example_domain_model"

FIXTURES = {
  :users => {
    :jan => {
      :full_name => "Jan Nelson",
      :age => 31,
      :signed_up_at => 1253740028201
    },
    :wil => {
      :full_name => "Wil Bierbaum",
      :age => 29,
      :signed_up_at => 1253740022000
    }
  },

  :blogs => {
    :grain => {
      :title => "All about grain",
      :user_id => "jan"
    },
    :vegetable => {
      :title => "All about vegetables"
    }
  },

  :blog_posts => {
    :grain_quinoa => {
      :title => "Quinoa",
      :body => "Quinoa is so good. I mean really.",
      :blog_id => "grain",
      :created_at => 1253740028201
    },
    :grain_barley => {
      :title => "Barley",
      :body => "Barley aint bad either but takes forever to cook!",
      :blog_id => "grain",
      :created_at => 1253740021201
    },
    :grain_millet => {
      :title => "Millet",
      :body => "WTF is millet?",
      :blog_id => "grain",
      :created_at => 1253740008201
    },
    :vegetable_daikon => {
      :title => "Daikon",
      :body => "It's hard to believe they're radishes.",
      :blog_id => "vegetable",
      :created_at => 1253740028001
    },
    :vegetable_kale => {
      :title => "Kale",
      :body => "Dark leafy pleasure",
      :blog_id => "vegetable",
      :created_at => 1253740022201
    }
  }
}

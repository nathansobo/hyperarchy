require "#{File.dirname(__FILE__)}/../../lib/ce2"
require "spec"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Domain.clear_tables
    Domain.load_fixtures
  end
end

Answer.fixtures(
  :grain_quinoa => {
    :body => "Quinoa",
    :correct => true,
    :question_id => "grain"
  },
  :grain_barley => {
    :body => "Barley",
    :correct => false,
    :question_id => "grain"
  },
  :grain_millet => {
    :body => "Millet",
    :correct => false,
   :question_id => "grain"
  },
  :vegetable_daikon => {
    :body => "Daikon",
    :correct => false,
    :question_id => "vegetable"
  },
  :vegetable_kale => {
    :body => "Kale",
    :correct => true,
    :question_id => "vegetable"
  }
)

Question.fixtures(
  :grain => {
    :stimulus => "What's your favorite grain?",
    :question_set_id => "foods"
  },
  :vegetable => {
   :stimulus => "What's your favorite vegetable?",
   :question_set_id => "foods"
  }
)

QuestionSet.fixtures(
  :foods => {}
)
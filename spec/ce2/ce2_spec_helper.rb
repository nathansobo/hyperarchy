require "#{File.dirname(__FILE__)}/../../lib/ce2"
require "spec"

Spec::Runner.configure do |config|
  config.mock_with :rr

  config.before do
    Domain.clear_tables
    Domain.load_fixtures
  end
end

Answer.fixtures({
  :grain_quinoa => {
    :body => "Quinoa",
    :correct => true
  },
  :grain_barley => {
    :body => "Barley",
    :correct => false
  },
  :grain_millet => {
    :body => "Millet",
    :correct => false
  }
})

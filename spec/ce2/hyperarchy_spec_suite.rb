dir = File.dirname(__FILE__)

Dir["#{dir}/**/*_spec.rb"].each do |path|
  require path
end
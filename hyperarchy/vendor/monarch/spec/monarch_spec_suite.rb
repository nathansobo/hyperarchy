dir = File.dirname(__FILE__)
Dir["#{dir}/**/*_spec.rb"].each do |spec_path|
  require spec_path
end

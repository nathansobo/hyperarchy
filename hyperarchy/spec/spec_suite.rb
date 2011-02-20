dir = File.expand_path(File.dirname(__FILE__))

$LOAD_PATH << dir

Dir["#{dir}/**/*_spec.rb"].each do |spec_path|
  require spec_path
end
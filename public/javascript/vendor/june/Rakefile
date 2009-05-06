desc "Package all scripts into june.js"
task :package do
  require "sprockets"
  Dir.mkdir("pkg") unless File.exists?("pkg")
  secretary = Sprockets::Secretary.new(
    :root => File.dirname(__FILE__),
    :asset_root   => "pkg",
    :load_path    => ["lib/**/*", "vendor", "vendor/**/*"],
    :source_files => ["lib/june.js"]
  )
  secretary.concatenation.save_to("pkg/june.js")
end

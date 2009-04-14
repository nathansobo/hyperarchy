desc "Package all scripts into june.js"
task :package do
  require "sprockets"
  Dir.mkdir("pkg") unless File.exists?("pkg")
  secretary = Sprockets::Secretary.new(
    :asset_root   => "pkg",
    :load_path    => ["lib/**/*"],
    :source_files => ["lib/june.js"]
  )
  secretary.concatenation.save_to("pkg/june.js")
end

$LOAD_PATH.unshift File.expand_path("../lib", __FILE__)
require "prequel/version"

desc "Build prequel #{Prequel::VERSION}"
task :build do
  system "gem build prequel.gemspec"
end

desc "Push prequel #{Prequel::VERSION} to the gem repository"
task :release => :build do
  system "gem push prequel-#{Prequel::VERSION}"
end

desc "Run prequel specs"
task :spec do
  system "rspec spec/prequel"
end

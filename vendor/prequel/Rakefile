$LOAD_PATH.unshift File.expand_path("../lib", __FILE__)
require "prequel/version"

task :default => :spec

desc "Build prequel #{Prequel::VERSION}"
task :build do
  system "gem build prequel.gemspec"
end

desc "Push prequel #{Prequel::VERSION} to the gem repository"
task :release => :build do
  system "gem push prequel-#{Prequel::VERSION}.gem"
end

desc "Run prequel specs"
task :spec do
  system "rspec spec/prequel"
end

namespace :db do
  desc "Create the test database in postgres"
  task :create do
    system "createdb -E utf8 prequel_test"
  end

  task :drop do
    system "dropdb prequel_test"
  end
end

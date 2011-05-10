# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "gift_wrapper/version"

Gem::Specification.new do |s|
  s.name        = "gift_wrapper"
  s.version     = GiftWrapper::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Nathan Sobo"]
  s.email       = ["nathansobo@gmail.com"]
  s.homepage    = ""
  s.summary     = %q{Packages javascript from disparate directories using //= require style}
  s.description = %q{}

  s.rubyforge_project = "gift_wrapper"

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]

  s.add_development_dependency('rack-test')
end

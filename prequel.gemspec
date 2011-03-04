# -*- encoding: utf-8 -*-
lib = File.expand_path('../lib/', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)

require 'prequel/version'

Gem::Specification.new do |s|
  s.name        = "prequel"
  s.version     = Prequel::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Nathan Sobo"]
  s.email       = ["nathansobo@gmail.com"]
  s.homepage    = "http://github.com/nathansobo/prequel"
  s.summary     = "A ground-up relational algebraic ORM."
  s.description = "Prequel is the database library I've always wanted."

  s.add_dependency('i18n', '>= 0.5.0')
  s.add_dependency('activesupport', '>= 3.0.4')
  s.add_dependency('sequel', '>= 3.20.0')

  s.add_development_dependency "rspec"
  s.add_development_dependency "rr"
  s.add_development_dependency "pg"

  s.files        = Dir.glob("lib/**/*") + %w(LICENSE README.md)
  s.require_path = 'lib'
end
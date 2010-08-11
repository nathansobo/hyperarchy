dir = File.expand_path(File.dirname(__FILE__))

require "rubygems"
require "bundler"
require "enumerator"

require "rgl/topsort"
require "rgl/adjacency"

require "#{dir}/research/ranking"
require "#{dir}/research/election"

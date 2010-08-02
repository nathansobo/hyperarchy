dir = File.expand_path(File.dirname(__FILE__))
require "#{dir}/research/ranking"
require "#{dir}/research/election"

require "rubygems"
require "bundler"

require "rgl/topsort"
require "rgl/adjacency"

#require "rgl/base"
#require "rgl/dot"
#require "rgl/traversal"
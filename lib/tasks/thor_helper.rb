#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

$LOAD_PATH << File.expand_path('../..', __FILE__)

require "rubygems"
require "bundler/setup"
require 'pathname'
require 'logger'

def require_environment(env='development')
  ENV['RAILS_ENV'] = env
  require File.expand_path('../../../config/environment', __FILE__)
end
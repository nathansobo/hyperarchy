require "rubygems"
require "sequel"
require "activesupport"

dir = File.dirname(__FILE__)
require "#{dir}/june/relations"
require "#{dir}/june/repository"
require "#{dir}/june/tuple"

module June

  def self.origin
    @origin ||= Repository.new 
  end

end
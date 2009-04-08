class Attribute
  attr_reader :set, :name, :type

  def initialize(set, name, type)
    @set, @name, @type = set, name, type
  end
end
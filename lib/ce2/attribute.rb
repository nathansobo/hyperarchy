class Attribute
  attr_reader :set, :name, :type

  def initialize(set, name, type)
    @set, @name, @type = set, name, type
  end

  def convert_value(value)
    value
  end
end
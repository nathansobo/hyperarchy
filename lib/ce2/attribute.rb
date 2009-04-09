class Attribute
  attr_reader :set, :name, :type

  def initialize(set, name, type)
    @set, @name, @type = set, name, type
  end

  def convert_value(value)
    value
  end

  def to_sql
    "#{set.global_name}.#{name}"
  end
end
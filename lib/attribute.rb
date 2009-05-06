class Attribute
  class << self
    def from_wire_representation(representation)
      set = GlobalDomain.sets_by_name[representation["set"].to_sym]
      set.attributes_by_name[representation["name"].to_sym]
    end
  end

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

  def eq(right_operand)
    Predicates::Eq.new(self, right_operand)
  end
end
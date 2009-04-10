class Object
  def to_sql
    inspect
  end
end

class String
  def to_sql
    inspect
  end
end

class TrueClass
  def to_sql
    "t".inspect
  end
end

class FalseClass
  def to_sql
    "f".inspect
  end
end

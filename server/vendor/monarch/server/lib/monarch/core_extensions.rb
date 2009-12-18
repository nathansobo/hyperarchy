class Class
  def basename
    name.split("::").last
  end
end

class Object
  def where_clause_sql
    inspect
  end

  def eigenclass
    class << self
      self
    end
  end

  def class_eval(*args, &block)
    eigenclass.class_eval(*args, &block)
  end

  def union(*operands, &block)
    Model::Relations::Union.new(operands, &block)
  end
end

class Symbol
  def starts_with?(prefix)
    to_s.starts_with?(prefix)
  end

  def singularize
    to_s.singularize.to_sym
  end

  def pluralize
    to_s.pluralize.to_sym
  end
end

class String
  def starts_with?(prefix)
    index(prefix) == 0
  end

  def path_starts_with?(prefix)
    split('/').starts_with?(prefix.split('/'))
  end
end

class Array
  def starts_with?(prefix)
    return true if prefix.empty?
    return false if prefix.size > size
    prefix.each_with_index do |element, index|
      return false unless self[index] == element
    end
    true
  end
end

class TrueClass
  def where_clause_sql
    1
  end
end

class FalseClass
  def where_clause_sql
    0
  end
end

class NilClass
  def where_clause_sql
    "null"
  end
end

class Time
  def to_millis
    to_i * 1000
  end

  def ==(other)
    to_i == other.to_i
  end
end

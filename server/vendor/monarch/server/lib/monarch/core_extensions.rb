class Class
  def basename
    name.split("::").last
  end

  def thread_local_accessor(*names)
    names.each do |name|
      define_method(name) do
        Thread.current["#{name}_#{hash}"]
      end

      define_method("#{name}=") do |val|
        Thread.current["#{name}_#{hash}"] = val
      end
    end
  end
end

class Object
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

module SqlLiteralExpression
  def sql_expression(state)
    Monarch::Model::Sql::Literal.new(state.next_literal_placeholder_name, self)
  end
end

class Fixnum
  include SqlLiteralExpression
end

class Float
  include SqlLiteralExpression
end

class String
  include SqlLiteralExpression

  def starts_with?(prefix)
    index(prefix) == 0
  end

  def path_starts_with?(prefix)
    split('/').starts_with?(prefix.split('/'))
  end

  def to_key
    if self =~ /^-?\d+$/
      Integer(self)
    else
      hash
    end
  end

  def from_json
    JSON.parse(self)
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

  def filter_blanks
    compact.reject {|e| e == ""}
  end
end

class Hash
  def transform
    key_values = self.map do |k,v|
      yield [k, v]
    end
    Hash[*key_values.compact.flatten]
  end
end

class TrueClass
  include SqlLiteralExpression
end

class FalseClass
  include SqlLiteralExpression
end

class NilClass
  include SqlLiteralExpression
end

class Time
  include SqlLiteralExpression

  def to_millis
    to_i * 1000
  end

  def ==(other)
    to_i == other.to_i
  end
end

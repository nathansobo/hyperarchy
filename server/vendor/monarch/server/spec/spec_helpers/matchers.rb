module Matchers
  class BeLike
    def initialize(expected)
      @expected = expected
    end

    def matches?(actual)
      @actual = actual
      normalize(@expected) == normalize(@actual)
    end

    NORMALIZATIONS = {
      /\s+/ => ' ',
      /\(\s+/ => '(',
      /\s+\)/ => ')'
    }
    
    def normalize(string)
      new_string = string
      NORMALIZATIONS.each do |regex, replacement|
        new_string = new_string.gsub(regex, replacement)
      end
      new_string.strip
    end

    def failure_message
      "expected\n#{@actual}\nto be like\n#{@expected}"
    end

    def negative_failure_message
      "expected\n#{@actual}\nto be unlike\n#{@expected}"
    end
  end

  def be_like(expected)
    BeLike.new(expected)
  end
end
require 'differ'

module BeLikeQueryMatcher
  class BeLikeQuery
    def initialize(expected_query, expected_literals)
      @expected_query, @expected_literals = expected_query, expected_literals
    end

    def matches?(actual)
      @actual_query, @actual_literals = actual
      query_matches? && literals_match?
    end

    NORMALIZATIONS = {
      /\s+/ => ' ',
      /\(\s+/ => '(',
      /\s+\)/ => ')'
    }

    def normalize_query(string)
      new_string = string
      NORMALIZATIONS.each do |regex, replacement|
        new_string = new_string.gsub(regex, replacement)
      end
      new_string.strip
    end

    def query_matches?
      normalize_query(@expected_query) == normalize_query(@actual_query)
    end

    def diff_queries
      Differ.diff_by_word(normalize_query(@actual_query), normalize_query(@expected_query))
    end

    def literals_match?
      @expected_literals == @actual_literals
    end

    def failure_message
      message = []
      unless query_matches?
        message.push("expected\n#{@actual_query}\nto be like\n#{@expected_query}\ndiff: #{diff_queries}")
      end
      unless literals_match?
        message.push("expected literals hash\n#{@actual_literals.inspect}\nto ==\n#{@expected_literals.inspect}")
      end
      message.join("\n")
    end

    def negative_failure_message
      raise "Negative failure message not implemented yet"
    end
  end

  def be_like_query(query, literals={})
    BeLikeQuery.new(query, literals)
  end
end
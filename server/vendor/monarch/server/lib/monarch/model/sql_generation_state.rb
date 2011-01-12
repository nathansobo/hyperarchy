module Monarch
  module Model
    class SqlGenerationState
      attr_reader :derived_table_count, :literal_placeholder_count, :memo_table
      delegate :[], :to => :memo_table

      def initialize
        @derived_table_count = 0
        @literal_placeholder_count = 0
        @memo_table = Hash.new {|h,k| h[k] = {}}
      end

      def next_derived_table_name
        @derived_table_count += 1
        "t#{derived_table_count}"
      end

      def next_literal_placeholder_name
        @literal_placeholder_count += 1
        "v#{literal_placeholder_count}".to_sym
      end
    end
  end
end
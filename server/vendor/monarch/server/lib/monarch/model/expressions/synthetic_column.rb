module Model
  module Expressions
    class SyntheticColumn < Column
      attr_reader :signal_definition

      def initialize(table, name, type, signal_definition)
        super(table, name, type)
        @signal_definition = signal_definition
      end
    end
  end
end

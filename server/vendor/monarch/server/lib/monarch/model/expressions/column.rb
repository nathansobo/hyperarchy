module Model
  module Expressions
    class Column < Expression
      attr_reader :table, :name, :type

      def initialize(table, name, type)
        @table, @name, @type = table, name, type
      end

      def convert_value_for_wire(value)
        case type
          when :datetime
            value ? value.to_millis : nil
          else
            value
        end
      end
    end
  end
end

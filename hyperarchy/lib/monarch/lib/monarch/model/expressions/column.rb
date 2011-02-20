module Monarch
  module Model
    module Expressions
      class Column < Expression
        class << self
          def from_wire_representation(representation, repository)
            table = repository.get_view(representation["table"].to_sym)
            table.column(representation["name"].to_sym)
          end
        end

        attr_reader :table, :name
        attr_accessor :type

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
end
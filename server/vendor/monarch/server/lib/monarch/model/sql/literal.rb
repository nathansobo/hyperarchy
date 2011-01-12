module Monarch
  module Model
    module Sql
      class Literal
        attr_reader :name, :value
        delegate :nil?, :to => :value

        def initialize(name, value)
          @name, @value = name, value
        end

        def to_sql
          name.inspect
        end

        def literals_hash
          { name => value }
        end
      end
    end
  end
end
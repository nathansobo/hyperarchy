module Prequel
  class CompositeTuple
    attr_reader :left, :right

    def initialize(left, right)
      @left, @right = left, right
    end

    def [](name)
      get_record(name) || get_field_value(name)
    end

    def get_record(table_name)
      left.try(:get_record, table_name) || right.try(:get_record, table_name)
    end

    def get_field_value(name)
      if name =~ /(.+)__(.+)/
        table_name = $1.to_sym
        field_name = $2.to_sym
        get_record(table_name).try(:get_field_value, field_name)
      else
        left.try(:get_field_value, name) || right.try(:get_field_value, name)
      end
    end

    def field_values
      [left.field_values, right.field_values]
    end

    delegate :inspect, :to => :field_values
  end
end
module Prequel
  class Changeset < ::Hash
    alias_method :changed?, :has_key?
    attr_reader :record

    def initialize(record)
      @record = record
    end

    def old(field_name)
      self[field_name][:old_value]
    end

    def new(field_name)
      self[field_name][:new_value]
    end

    def changed(field_name, old_value, new_value)
      self[field_name] = {
        :old_value => old_value,
        :new_value => new_value
      }
    end

    def wire_representation
      Hash[self.map do |key, values|
        column = record.get_column(key)
        new_value_wire_representation = column.convert_value_for_wire(values[:new_value])
        [key.to_s, new_value_wire_representation]
      end]
    end
  end
end
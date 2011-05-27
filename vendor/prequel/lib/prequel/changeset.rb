module Prequel
  class Changeset < ::Hash
    alias_method :changed?, :has_key?

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
        [key.to_s, values[:new_value]]
      end]
    end
  end
end
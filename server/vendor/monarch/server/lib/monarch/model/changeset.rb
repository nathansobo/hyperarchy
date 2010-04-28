module Monarch
  module Model
    class Changeset
      attr_reader :new_state, :old_state

      def initialize(new_state, old_state)
        @new_state, @old_state = new_state, old_state
      end

      def has_changes?
        new_state.fields.each do |field|
          return true if changed?(field.column)
        end
        false
      end

      def changed?(column_or_name)
        new_state.field(column_or_name).value != old_state.field(column_or_name).value
      end

      def wire_representation
        wire_representation = {}
        new_state.fields.each do |field|
          wire_representation[field.name.to_s] = field.value_wire_representation if changed?(field.column)
        end
        wire_representation
      end

      def ==(other)
        return false unless self.class == other.class
        new_state == other.new_state && old_state == other.old_state
      end

      def inspect
        inspect_hash = {}
        new_state.fields.each do |field|
          next unless changed?(field.column)
          inspect_hash[field.name] = {
            :old => old_state.field(field.name).value,
            :new => field.value
          }
        end
        inspect_hash.inspect
      end
    end
  end
end
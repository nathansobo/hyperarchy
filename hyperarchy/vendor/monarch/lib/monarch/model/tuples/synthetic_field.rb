module Monarch
  module Model
    class SyntheticField < Field
      attr_reader :signal

      def initialize(record, column)
        super(record, column)
        if column.signal_definition
          @signal = record.instance_eval(&column.signal_definition)
          @value = signal.value
          @remote_value = signal.remote_value

          signal.on_update do |new_value|
            if @value != new_value
              @value = new_value
              mark_dirty
            end
          end
          @inert = false
        else
          @inert = true
        end
      end

      def value
        if inert?
          record.send(column.name)
        else
          super
        end
      end

      def value=(value)
        raise "This is a snapshot field. It is read only." if snapshot?
        record.send("#{name}=", value)
      end

      def inert?
        @inert
      end
    end
  end
end
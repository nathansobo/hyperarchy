module Model
  class SyntheticField < Field
    attr_reader :signal

    def initialize(record, column, signal)
      super(record, column)
      @record, @column, @signal = record, column, signal
      @value = signal.value
      @remote_value = signal.remote_value

      signal.on_update do |new_value|
        @value = new_value
        mark_dirty
      end
    end

    def value=(value)
      raise "This is a snapshot field. It is read only." if snapshot?
      record.send("#{name}=", value)
    end
  end
end

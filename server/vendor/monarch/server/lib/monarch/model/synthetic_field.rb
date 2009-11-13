module Model
  class SyntheticField < Field
    attr_reader :value

    def initialize(record, column, signal)
      super(record, column)
      @signal = record, column, signal 
      @value = signal.value
      signal.on_update do |new_value|
        @value = new_value
        mark_dirty
      end
    end

    def value=(value)
      record.send("#{name}=", value)
    end
  end
end

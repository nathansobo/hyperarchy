class Class
  def remove_class
    parent.send(:remove_const, name.demodulize) if parent.const_defined?(name.demodulize, false)
  end
end

module Prequel
  class Record
    def self.remove_class
      super
      Prequel.record_classes.delete(self)
    end
  end
end

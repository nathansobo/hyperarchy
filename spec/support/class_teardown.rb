class Class
  def remove_class
    parent.send(:remove_const, name.demodulize) if parent.const_defined?(name.demodulize)
  end
end
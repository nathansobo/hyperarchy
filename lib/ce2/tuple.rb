class Tuple
  class << self
    attr_accessor :set

    def inherited(subclass)
      subclass.set = Domain.new_set(subclass.basename.underscore.pluralize.to_sym, subclass)
    end

    def attribute(name, type)
      set.define_attribute(name, type)

      metaclass.send(:define_method, name) do
        set.attributes_by_name[name]
      end
    end

    def basename
      name.split("::").last
    end
  end



  def initialize(attributes)
    
  end
end

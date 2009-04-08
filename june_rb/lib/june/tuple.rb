module June
  class Tuple
    class << self
      attr_accessor :set

      def inherited(subclass)
        subclass.set = Relations::Set.new(subclass.basename.underscore.pluralize)
      end

      def basename
        name.split("::").last
      end
    end

    def initialize(attributes)
      
    end
  end
end

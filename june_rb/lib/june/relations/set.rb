module June
  module Relations
    class Set
      attr_reader :global_name

      def initialize(global_name)
        @global_name = global_name
      end
    end
  end
end
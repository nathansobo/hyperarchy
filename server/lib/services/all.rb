module Services
  class All
    class << self
      def run
        all_services.each {|s| s.run}
      end

      def start
        all_services.each {|s| s.start}
      end

      def stop
        all_services.each {|s| s.stop}
      end

      protected
      def all_services
        [Openfire, Nginx]
      end
    end
  end
end
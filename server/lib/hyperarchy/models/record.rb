module Monarch
  module Model
    class Record
      class << self
        def current_user=(user)
          Thread.current["current_user"] = user
        end

        def current_user
          Thread.current["current_user"]
        end
      end

      delegate :current_user, :to => "self.class"

      def lock
        table.lock(id)
      end

      def unlock
        table.unlock(id)
      end
    end
  end
end
module Monarch
  module Util
    class LockPool
      class RecursiveMutex
        attr_accessor :lock_count

        def initialize
          self.lock_count = 0
          self.lock_depth = 0
          self.mutex = Mutex.new
        end

        def lock
          self.lock_depth += 1
          mutex.lock if lock_depth == 1
        end

        def unlock
          self.lock_depth -= 1
          mutex.unlock if lock_depth == 0
        end

        protected
        attr_accessor :mutex
        thread_local_accessor :lock_depth
      end

      def initialize
        @outer_mutex = Mutex.new
        @named_mutexes = Hash.new {|h,k| h[k] = RecursiveMutex.new}
      end

      def lock(name)
        outer_mutex.lock
        named_mutex = named_mutexes[name]
        named_mutex.lock_count += 1
        outer_mutex.unlock
        named_mutex.lock
      end

      def unlock(name)
        outer_mutex.lock
        unless named_mutexes.has_key?(name)
          raise "Cannot release non-existent lock: #{name.inspect}"
        end
        named_mutex = named_mutexes[name]
        named_mutex.lock_count -= 1
        named_mutexes.delete(name) if named_mutex.lock_count == 0

        named_mutex.unlock
        outer_mutex.unlock
      end

      protected
      attr_reader :outer_mutex, :named_mutexes
    end
  end
end
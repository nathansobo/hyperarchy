module Monarch
  module Util
    class LockPool
      NamedMutex = Struct.new(:ref_count, :mutex)
      
      def initialize
        @outer_mutex = Mutex.new
        @named_mutexes = Hash.new {|h,k| h[k] = NamedMutex.new(0, Mutex.new)}
      end

      def lock(name)
        outer_mutex.lock
        named_mutex = named_mutexes[name]
        named_mutex.ref_count += 1
        puts "Locking #{name} -- #{named_mutex.ref_count}"
        outer_mutex.unlock
        named_mutex.mutex.lock
      end

      def unlock(name)
        outer_mutex.lock
        unless named_mutexes.has_key?(name)
          raise "Cannot release non-existent lock: #{name.inspect}"
        end
        named_mutex = named_mutexes[name]
        named_mutex.ref_count -= 1
        puts "Unlocking #{name} -- #{named_mutex.ref_count}"
        named_mutexes.delete(name) if named_mutex.ref_count == 0
        p named_mutexes.keys

        named_mutex.mutex.unlock
        outer_mutex.unlock
      end

      protected
      attr_reader :outer_mutex, :named_mutexes
    end
  end
end
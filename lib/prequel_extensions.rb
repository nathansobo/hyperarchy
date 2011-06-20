module Prequel
  class Session
    attr_accessor :current_user
  end

  class Record
    include RunLater::InstanceMethods

    def current_user
      Prequel.session.current_user
    end

    def extra_records_for_events
      []
    end

    def lock_name
      @lock_name ||= "/#{table.name}/#{id}"
    end

    def lock
      $redis.lock(lock_name) if incr_lock_depth == 1
    end

    def unlock
      $redis.unlock(lock_name) if decr_lock_depth == 0
    end

    def incr_lock_depth
      Prequel.session.lock_depth[lock_name] += 1
    end

    def decr_lock_depth
      Prequel.session.lock_depth[lock_name] -= 1
    end

    def can_update_columns?(columns)
      (columns - (update_whitelist - update_blacklist)).empty?
    end
  end

  class Session
    def lock_depth
      @lock_depth ||= Hash.new {|h,k| h[k] = 0}
    end
  end
end
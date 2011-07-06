module Prequel
  class Session
    attr_accessor :current_user
  end

  class Record
    include RunLater::InstanceMethods

    def self.raw_create(attributes={})
      new(attributes).tap(&:raw_save)
    end

    def raw_update(attributes={})
      soft_update(attributes)
      raw_save
    end

    def raw_save
      if persisted?
        initial_changeset = build_changeset
        return true unless dirty?
        self.updated_at = Time.now if fields_by_name.has_key?(:updated_at)

        dirty_fields = dirty_field_values
        final_changeset = build_changeset
        table.where(:id => id).update(dirty_fields) unless dirty_fields.empty?
        mark_clean
      else
        self.created_at = Time.now if fields_by_name.has_key?(:created_at)
        self.updated_at = Time.now if fields_by_name.has_key?(:updated_at)
        self.id = (DB[table.name] << field_values_without_nil_id)
        Prequel.session[table.name][id] = self
        mark_clean
      end
      true
    end

    def current_user
      Prequel.session.current_user
    end

    def extra_records_for_create_events
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
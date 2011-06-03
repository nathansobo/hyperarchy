module Prequel
  class Session
    def initialize
      @identity_map = Hash.new {|h,k| h[k] = {}}
      @transaction_depth = 0
    end

    attr_accessor :transaction_depth
    delegate :[], :[]=, :to => :identity_map

    def handle_create_event(record)
      deferred_create_events[record.class].push(record)
      flush_deferred_events if transaction_depth.zero?
    end

    def handle_update_event(record, changeset)
      deferred_update_events[record.class].push([record, changeset])
      flush_deferred_events if transaction_depth.zero?
    end

    def handle_destroy_event(record)
      deferred_destroy_events[record.class].push(record)
      flush_deferred_events if transaction_depth.zero?
    end

    def flush_deferred_events
      create_events = deferred_create_events
      update_events = deferred_update_events
      destroy_events = deferred_destroy_events
      clear_deferred_events


      create_events.each do |klass, events|
        events.each do |event|
          klass.on_create_node.publish(event)
        end
      end

      update_events.each do |klass, events|
        events.each do |event|
          klass.on_update_node.publish(*event)
        end
      end

      destroy_events.each do |klass, events|
        events.each do |event|
          klass.on_destroy_node.publish(event)
        end
      end
    end

    def clear_deferred_events
      @deferred_create_events = nil
      @deferred_update_events = nil
      @deferred_destroy_events = nil
    end

    protected
    attr_reader :identity_map

    def deferred_create_events
      @deferred_create_events ||= build_deferred_event_hash
    end

    def deferred_update_events
      @deferred_update_events ||= build_deferred_event_hash
    end

    def deferred_destroy_events
      @deferred_destroy_events ||= build_deferred_event_hash
    end

    def build_deferred_event_hash
      Hash.new{|h,k| h[k] = []}
    end
  end
end

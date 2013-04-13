require 'build_client_dataset'

module EventObserver
  include BuildClientDataset
  extend self

  def observe(*record_classes)
    record_classes.each do |record_class|
      record_class.on_create do |record|
        event = ['create', record.table.name.to_s, record.wire_representation, build_client_dataset(record.extra_records_for_create_events)]
        post_event(record.broadcast_channels, event)
      end
      record_class.on_update do |record, changeset|
        event = ['update', record.table.name.to_s, record.id, changeset.wire_representation]
        post_event(record.broadcast_channels, event)
      end
      record_class.on_destroy do |record|
        event = ['destroy', record.table.name.to_s, record.id]
        post_event(record.broadcast_channels, event)
      end
    end
  end

  def post_event(channels, event)
    return unless channels
    channels.each do |channel|
      Pusher[channel].trigger_async 'operation', event
    end
  end
end

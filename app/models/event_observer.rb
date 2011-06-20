module EventObserver
  include HttpClient
  include BuildClientDataset
  extend self

  def observe(*record_classes)
    record_classes.each do |record_class|
      record_class.on_create do |record|
        event = ['create', record.table.name, record.wire_representation, build_client_dataset(record.extra_records_for_create_events)]
        post_event(record.organization_ids, event)
      end
      record_class.on_update do |record, changeset|
        event = ['update', record.table.name, record.id, changeset.wire_representation]
        post_event(record.organization_ids, event)
      end
      record_class.on_destroy do |record|
        event = ['destroy', record.table.name, record.id]
        post_event(record.organization_ids, event)
      end
    end
  end

  def post_event(organization_ids, event)
    organization_ids.each do |org_id|
      post("http://#{SOCKET_SERVER_HOST}/channel_events/organizations/#{org_id}", :params => { :message => event.to_json })
    end
  end
end

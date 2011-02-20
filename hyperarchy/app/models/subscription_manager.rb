class SubscriptionManager
  include Monarch::Util
  
  class << self
    def instance; @instance ||= new; end
    delegate :start, :subscribe_to_organization, :to => :instance
  end

  SUBSCRIBED_TABLES = [:organizations, :users, :memberships, :elections, :candidates,
                       :votes, :election_visits, :rankings, :candidate_comments]

  def initialize
    @mutex = Mutex.new
    @organization_nodes_by_id = Hash.new {|h, k| h[k] = SubscriptionNode.new(:thread_safe)}
  end

  def start
    subscribe_to_tables
  end

  def subscribe_to_organization(client, organization)
    raise Monarch::Unauthorized unless organization.allow_subscription?(client.user)
    client.subscribe(organization_node(organization.id))
  end

  protected
  attr_reader :mutex, :organization_nodes_by_id

  def subscribe_to_tables
    tables.each do |table|
      table_name = table.global_name.to_s

      table.on_insert do |record|
        each_organization_node(record) do |node|
          node.publish(["create", table_name, record.wire_representation])
        end
      end

      table.on_update do |record, changeset|
        each_organization_node(record) do |node|
          node.publish(["update", table_name, record.id, changeset.wire_representation])
        end
      end

      table.on_remove do |record|
        each_organization_node(record) do |node|
          node.publish(["destroy", table_name, record.id])
        end
      end
    end
  end

  def each_organization_node(record, &block)
    Hyperarchy.defer do
      organization_nodes(record).each(&block)
    end
  end

  def organization_nodes(record)
    record.organization_ids.map do |organization_id|
      organization_node(organization_id)
    end
  end

  def organization_node(id)
    mutex.synchronize { organization_nodes_by_id[id] }
  end

  def tables
    SUBSCRIBED_TABLES.map do |name|
      Monarch::Model::Repository.tables_by_name[name]
    end
  end
end

module Model
  class ConcreteField < Field
    attr_reader :value

    delegate :name, :to => :column

    def initialize(record, column)
      super(record, column)
      @update_node = Util::SubscriptionNode.new
    end

    def value=(value)
      new_value = column.convert_value_for_storage(value)
      old_value = @value
      if old_value != new_value
        @value = new_value
        mark_dirty
        update_node.publish(new_value, old_value)
      end
    end

    def on_update(&block)
      update_node.subscribe(&block)
    end

    def where_clause_sql
      value.where_clause_sql
    end

    def signal(&block)
      Signal.new(self, &block)
    end

    protected
    attr_reader :update_node
  end
end

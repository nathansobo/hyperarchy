module Model
  class Signal
    def initialize(source, &transformer)
      @source, @transformer = source, transformer
      @update_node = Util::SubscriptionNode.new
      source.on_update do |new_value, old_value|
        update_node.publish(transformer.call(new_value, old_value))
      end
    end
    
    def value
      source.value
    end

    def on_update(&proc)
      update_node.subscribe(&proc)
    end

    protected
    attr_reader :source, :transformer, :proc, :update_node
  end
end

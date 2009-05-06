module("June", function(c) { with(c) {
  module("Relations", function() {
    constructor("Set", function() {
      include(June.Relations.RelationMethods);
      include(June.Subscribable);
      include(June.TupleSupervisor);

      def('initialize', function(global_name, configuration_fn) {
        this.global_name = global_name.underscore().pluralize();
        var configuration = new June.Relations.SetConfiguration(this);
        configuration_fn(configuration);
        configuration.setup_tuple_constructor();
        this._tuples = [];
        this.initialize_nodes();

        this.events_are_paused = false;
        this.queued_events = [];
      });

      def('create', function(attributes) {
        return this.insert(new this.Tuple(attributes));
      });

      def('insert', function(tuple) {
        this._tuples.push(tuple)
        this.publish_or_enqueue_event(this.on_insert_node, [tuple]);
        return tuple;
      });

      def('remove', function(tuple) {
        if (June.remove(this._tuples, tuple)) {
          this.publish_or_enqueue_event(this.on_remove_node, [tuple]);
          return tuple;
        } else {
          return null;
        }
      });

      def('tuple_updated', function(tuple, updated_attributes) {
        this.publish_or_enqueue_event(this.on_update_node, [tuple, updated_attributes]);
      });

      def('publish_or_enqueue_event', function(subscription_node, publish_args) {
        if (this.events_are_paused) {
          this.queued_events.push(function() {
            subscription_node.publish.apply(subscription_node, publish_args);
          });
        } else {
          subscription_node.publish.apply(subscription_node, publish_args);
        }
      });

      def('pause_events', function() {
        this.events_are_paused = true;
      });

      def('resume_events', function() {
        this.events_are_paused = false;
        jQuery.each(this.queued_events, function() {
          this();
        });
        this.queued_events = [];
      });

      def('tuples', function() {
        return this._tuples.concat();
      });

      def('has_operands', function() {
        return false;
      });

      def("wire_representation", function() {
        return {
          type: "set",
          name: this.global_name
        };
      });
      
      def("update", function(snapshot_fragment) {
        this.add_or_update_tuples_from_snapshot_fragment(snapshot_fragment);
        this.remove_tuples_not_in_snapshot_fragment(snapshot_fragment);
      });

      def("add_or_update_tuples_from_snapshot_fragment", function(snapshot_fragment) {
        for (var id in snapshot_fragment) {
          var tuple = this.find(id);
          var attributes = snapshot_fragment[id];
          if (!tuple) {
            this.create(attributes);
          } else {
            tuple.update(attributes);
          }
        }
      });

      def("remove_tuples_not_in_snapshot_fragment", function(snapshot_fragment) {
        var self = this;
        this.each(function() {
          if (!snapshot_fragment[this.id()]) self.remove(this);
        });
      });
    });
  });
}});


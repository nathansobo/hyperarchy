module("June", function(c) { with(c) {
  constructor("Subscription", function() {
    def('initialize', function(node, handler) {
      this.node = node;
      this.handler = handler;
    });

    def('trigger', function(args) {
      this.handler.apply(null, args);
    });

    def('destroy', function() {
      this.node.unsubscribe(this);
    });
  });
}});
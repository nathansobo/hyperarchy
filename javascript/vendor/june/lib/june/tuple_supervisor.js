module("June", function(c) { with(c) {
  module("TupleSupervisor", function() {
    def('tuples', function() {
      throw_june_unimplemented(this, 'tuples');
    });

    def('memoize_tuples', function() {
      this._tuples = this.tuples();
    });

    def('contains', function(tuple) {
      return this.tuples().indexOf(tuple) != -1;
    });

    def('tuple_inserted', function(tuple) {
      this._tuples.push(tuple);
      this.on_insert_node.publish(tuple);
    });

    def('tuple_removed', function(tuple) {
      June.remove(this._tuples, tuple);
      this.on_remove_node.publish(tuple);
    });

    def('tuple_updated', function(tuple, updated_attributes) {
      this.on_update_node.publish(tuple, updated_attributes);
    });
  });
}});
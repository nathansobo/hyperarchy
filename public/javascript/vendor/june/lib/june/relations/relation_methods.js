module("June", function(c) { with(c) {
  module("Relations", function() {
    module("RelationMethods", function() {
      def('where', function(predicate) {
        return new June.Relations.Selection(this, predicate);
      });

      def('join', function(right_operand) {
        var left_operand = this;
        return {
          on: function(predicate) {
            return new June.Relations.InnerJoin(left_operand, right_operand, predicate);
          }
        }
      });

      def('project', function(projected_set) {
        return new June.Relations.SetProjection(this, projected_set);
      });

      // TODO: BR/NS - calling find with an id argument will only work on set because we have no general way of resolving attributes on relations
      def('find', function(id_or_predicate) {
        var predicate;
        if (id_or_predicate.evaluate) {
          predicate = id_or_predicate;
        } else {
          predicate = this.id.eq(id_or_predicate);
        }
        return this.where(predicate).first();
      });

      def('first', function() {
        return this.tuples()[0];
      });
      
      def('map', function(fn) {
        return June.map(this.tuples(), fn);
      });
      
      def('each', function(fn) {
        June.each(this.tuples(), fn);
      });
    });
  });
}});
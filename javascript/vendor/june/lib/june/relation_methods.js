module("June", function(c) { with(c) {
  module("RelationMethods", function() {
    def('join', function(right_operand) {
      var left_operand = this;
      return {
        on: function(predicate) {
          return new June.InnerJoin(left_operand, right_operand, predicate);
        }
      }
    });

    def('where', function(predicate) {
      return new June.Selection(this, predicate);
    });

    // TODO: BR/NS - calling find with an id argument will only work on set because we have no general way of resolving
    // attributes on relations

    def('find', function(id_or_predicate) {
      var predicate;
      if (id_or_predicate.evaluate) {
        predicate = id_or_predicate;
      } else {
        predicate = this.id.eq(id_or_predicate);
      }
      return this.where(predicate).first();
    });

    def('map', function(fn) {
      var results = [];
      this.each(function(){
        results.push(fn.call(this));
      });
      return results;
    });

    def('first', function() {
      return this.tuples()[0];
    });

    def('each', function(fn) {
      var tuples = this.tuples();
      for(var i = 0; i < tuples.length; i++) {
        fn.call(tuples[i]);
      }
    });
  });
}});
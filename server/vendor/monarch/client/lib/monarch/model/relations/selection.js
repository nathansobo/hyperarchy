constructor("Model.Relations.Selection", Model.Relations.Relation, {

  initialize: function(operand, predicate) {
    this.operand = operand;
    this.predicate = predicate;
    this.initialize_events_system();
  },

  all: function() {
    if (this.records) return this.records;

    var predicate = this.predicate;
    var all = [];
    this.operand.each(function() {
      if (predicate.evaluate(this)) all.push(this);
    });
    return all;
  },

  wire_representation: function() {
    return {
      type: "selection",
      operand: this.operand.wire_representation(),
      predicate: this.predicate.wire_representation()
    };
  },

  subscribe_to_operands: function() {
    this.memoize_records();

    var self = this;
    this.operands_subscription_bundle.add(this.operand.on_insert(function(record) {
      if (self.predicate.evaluate(record)) self.record_inserted(record);
    }));

    this.operands_subscription_bundle.add(this.operand.on_remove(function(record) {
      if (self.predicate.evaluate(record)) self.record_removed(record);
    }));

    this.operands_subscription_bundle.add(this.operand.on_update(function(record, changed_fields) {
      if (self.contains(record)) {
        if (self.predicate.evaluate(record)) {
          self.record_updated(record, changed_fields);
        } else {
          self.record_removed(record);
        }
      } else {
        if (self.predicate.evaluate(record)) self.record_inserted(record);
      }
    }));
  },

  evaluate_in_repository: function(repository) {
    return new Model.Relations.Selection(this.operand.evaluate_in_repository(repository), this.predicate);
  },

  primary_table: function() {
    return this.operand.primary_table();
  }
});

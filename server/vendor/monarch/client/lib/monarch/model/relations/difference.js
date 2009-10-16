(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Difference", Monarch.Model.Relations.Relation, {
  initialize: function(left_operand, right_operand) {
    this.left_operand = left_operand;
    this.right_operand = right_operand;
    this.initialize_events_system();
  },

  records: function() {
    if (this._records) return this._records;

    var self = this;
    var records = [];
    this.left_operand.each(function(record) {
      if (!self.right_operand.find(record.id())) records.push(record);
    });
    return records;
  },

  subscribe_to_operands: function() {
    var self = this;
    this.operands_subscription_bundle.add(this.left_operand.on_insert(function(record) {
      if (!self.right_operand.find(record.id())) self.record_inserted(record);
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_update(function(record, changes) {
      if (!self.right_operand.find(record.id())) self.record_updated(record, changes);
    }));

    this.operands_subscription_bundle.add(this.left_operand.on_remove(function(record) {
      if (!self.right_operand.find(record.id())) self.record_removed(record);
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_insert(function(record) {
      if (self.left_operand.find(record.id())) self.record_removed(record);
    }));

    this.operands_subscription_bundle.add(this.right_operand.on_remove(function(record) {
      if (self.left_operand.find(record.id())) self.record_inserted(record);
    }));
  }
});

})(Monarch);

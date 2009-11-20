(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.Difference", Monarch.Model.Relations.Relation, {
  initialize: function(left_operand, right_operand) {
    this.left_operand = left_operand;
    this.right_operand = right_operand;
    this.initialize_events_system();
  },

  records: function() {
    if (this._records) return this._records;
    var records = [];

    var left_records = this.left_operand.records().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var right_records = this.right_operand.records().sort(function(a, b) {
      if (a.id() < b.id()) return -1;
      if (a.id() > b.id()) return 1;
      return 0;
    });

    var right_index = 0;

    Monarch.Util.each(left_records, function(left_record, index) {
      if (right_records[right_index] && left_record.id() === right_records[right_index].id()) {
        right_index++;
      } else {
        records.push(left_record);
      }
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

(function(Monarch) {

Monarch.constructor("Monarch.Model.Relations.TableProjection", Monarch.Model.Relations.Relation, {
  initialize: function(operand, projected_table) {
    this.operand = operand;
    this.projected_table = projected_table;
    this.initialize_events_system();
  },

  has_operands: true,

  all_tuples: function() {
    if (this._tuples) return this._tuples;

    var all_tuples = [];
    Monarch.Util.each(this.operand.all_tuples(), function(composite_tuple) {
      var record = composite_tuple.record(this.projected_table);
      if (!Monarch.Util.contains(all_tuples, record)) all_tuples.push(record);
    }.bind(this));
    return all_tuples;
  },

  surface_tables: function() {
    return [this.projected_table];
  },

  // private

  subscribe_to_operands: function() {
    var self = this;
    this.operands_subscription_bundle.add(this.operand.on_insert(function(composite_tuple) {
      var tuple = composite_tuple.record(self.projected_table);
      if (!self.contains(tuple)) self.tuple_inserted(tuple);
    }));

    this.operands_subscription_bundle.add(this.operand.on_update(function(composite_tuple, changeset) {
      var updated_column_in_projected_table = Monarch.Util.detect(changeset, function(column_name, change) {
        return change.column.table == self.projected_table;
      });
      var record = composite_tuple.record(self.projected_table);

      if (updated_column_in_projected_table && !self.duplicates_last_update_event(record, changeset)) {
        self.last_update_event = [record, changeset];
        self.tuple_updated(record, changeset);
      }
    }));

    this.operands_subscription_bundle.add(this.operand.on_remove(function(composite_tuple) {
      var tuple = composite_tuple.record(self.projected_table);
      if (!self.operand.find(self.projected_table.column('id').eq(tuple.id()))) {
        self.tuple_removed(tuple);
      }
    }));
  },

  duplicates_last_update_event: function(record, changeset) {
    if (!this.last_update_event) return false;
    var last_record = this.last_update_event[0];
    var last_changset = this.last_update_event[1];
    if (last_record !== record) return false;
    if (!_(last_changset).isEqual(changeset)) return false;
    return true;
  }
});

})(Monarch);

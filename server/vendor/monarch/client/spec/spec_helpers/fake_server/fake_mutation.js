Monarch.constructor("FakeServer.FakeMutation", {
  constructor_initialize: function() {
    this.id_counter = 1;
  },

  initialize: function(url, command, batch) {
    this.url = url;
    this.command = command;
    this.batch = batch;

    this.type = Monarch.Inflection.underscore(command.constructor.basename).split("_")[0];
    this.table = command.table;
    this.record = command.record;
    this.field_values = command.field_values;

    this.table_name = command.table_name;
  },

  complete: function(field_values) {
    this.command.complete(field_values);
  },

  trigger_before_events: function() {
    this.command.trigger_before_events();
  },

  trigger_after_events: function() {
    this.command.trigger_after_events();
  },

  response_wire_representation: function() {
    switch (this.type) {
      case "update":
        return this.field_values;
      case "create":
        return jQuery.extend({}, this.field_values, { id: (this.constructor.id_counter++).toString() });
      case "destroy":
        return null;
    }
  },

  simulate_success: function(fake_response) {
    this.batch.simulate_success(fake_response ? { primary: [fake_response], secondary: []} : null);
  }
});

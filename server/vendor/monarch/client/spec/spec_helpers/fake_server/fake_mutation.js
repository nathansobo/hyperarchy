Monarch.constructor("FakeServer.FakeMutation", {
  constructor_initialize: function() {
    this.id_counter = 1;
  },

  initialize: function(url, command, fake_server) {
    this.url = url;
    this.command = command;
    this.fake_server = fake_server;

    this.type = Monarch.Inflection.underscore(command.constructor.basename).split("_")[0];
    this.table = command.table;
    this.record = command.record;

    if (this.type == "create") {
      this.field_values = command.wire_representation()[2];
    } else if (this.type == "update") {
      this.field_values = command.wire_representation()[3]
    }

    this.table_name = command.table_name;
    this.command_id = command.command_id;
    this.future = command.future;
  },

  complete_and_trigger_before_events: function(field_values) {
    this.command.complete_and_trigger_before_events(field_values);
  },

  trigger_after_events: function() {
    this.command.trigger_after_events();
  },

  response_wire_representation: function() {
    switch (this.type) {
      case "update":
        return this.record.wire_representation();
      case "create":
        var wire_representation = this.record.wire_representation();
        wire_representation.id = (this.constructor.id_counter++).toString();
        return wire_representation;
      case "destroy":
        return null;
    }
  },

  simulate_success: function(fake_response_wire_representation) {
    this.batch.simulate_success([fake_response_wire_representation || this.response_wire_representation()]);
  }
});

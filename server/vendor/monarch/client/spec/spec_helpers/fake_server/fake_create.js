Monarch.constructor("FakeServer.FakeCreate", {
  type: "create",
  
  constructor_initialize: function() {
    this.id_counter = 1;
  },

  initialize: function(url, table, field_values, fake_server) {
    this.url = url;
    this.table = table;
    this.field_values = field_values;
    this.new_record_id = this.constructor.id_counter++;
    this.fake_server = fake_server;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
    this.in_batch = false;
  },

  add_to_batch_requests: function(commands) {
    this.in_batch = true;
    var table_name = this.table.global_name;
    if (!commands[table_name]) commands[table_name] = {};
    commands[table_name]["create_" + this.new_record_id] = this;
  },

  simulate_success: function(server_field_values) {
    if (!server_field_values) server_field_values = {};

    var field_values = jQuery.extend({}, this.field_values, {id: this.new_record_id.toString()}, server_field_values);
    this.record = new this.table.record_constructor(field_values);

    if (!this.in_batch) Repository.pause_events();
    this.table.insert(this.record);
    this.future.trigger_before_events(this.record);
    if (!this.in_batch) {
      Repository.resume_events();
      this.future.trigger_after_events(this.record);
    }

    this.fake_server.remove_request(this);
  },

  trigger_after_events: function() {
    this.future.trigger_after_events(this.record);
  }
});

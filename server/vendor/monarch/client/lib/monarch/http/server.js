(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Http.Server", {
  initialize: function() {
    this.pending_commands = [];
  },

  fetch: function(relations) {
    var fetch_future = new Monarch.Http.RepositoryUpdateFuture();

    this.get(Repository.origin_url, {
      relations: Monarch.Util.map(relations, function(relation) {
        return relation.wire_representation();
      })
    })
      .on_success(function(data) {
        Repository.pause_events();
        Repository.update(data);
        fetch_future.trigger_before_events();
        Repository.resume_events();
        fetch_future.trigger_after_events();
      });

    return fetch_future;
  },

  create: function(table, field_values) {
    var command = new Monarch.Http.CreateCommand(table, field_values);
    return this.mutate(table, command)
  },

  update: function(record, values_by_method_name) {
    var command = new Monarch.Http.UpdateCommand(record, values_by_method_name);
    return this.mutate(record.table(), command);
  },

  destroy: function(record) {
    var command = new Monarch.Http.DestroyCommand(record);
    return this.mutate(record.table(), command);
  },

  mutate: function(table, command) {
    this.pending_commands.push(command);
    if (!this.batch_in_progress) this.perform_pending_mutations();
    return command.future;
  },

  perform_pending_mutations: function() {
    var self = this;
    var operation_wire_representations = Monarch.Util.map(this.pending_commands, function(command) {
      return command.wire_representation();
    });

    var pending_commands = this.pending_commands;
    this.pending_commands = [];

    this.post(Repository.origin_url, { operations: operation_wire_representations })
      .on_success(function(response_data) {
        self.handle_successful_mutation_response(pending_commands, response_data);
      })
      .on_failure(function(response_data) {
        self.handle_unsuccessful_mutation_response(pending_commands, response_data);
      });
  },

  handle_successful_mutation_response: function(pending_commands, response_data) {
    Repository.pause_events();

    Monarch.Util.each(response_data, function(response, index) {
      pending_commands[index].complete_and_trigger_before_events(response);
    });

    Repository.resume_events();

    Monarch.Util.each(pending_commands, function(command) {
      command.trigger_after_events();
    });
  },

  handle_unsuccessful_mutation_response: function(pending_commands, response_data) {
    Monarch.Util.each(pending_commands, function(command, index) {
      if (index == response_data.index) {
        command.handle_failure(response_data.errors)
      } else {
        command.handle_failure(null);
      }
    });
  },

  start_batch: function() {
    if (this.batch_in_progress) throw new Error("Batch already in progress");
    this.batch_in_progress = true;
  },

  finish_batch: function() {
    if (!this.batch_in_progress) throw new Error("No batch in progress");
    this.batch_in_progress = false;
    this.perform_pending_mutations();
  },

  post: function(url, data) {
    return this.request('POST', url, data);
  },

  get: function(url, data) {
    return this.request('GET', url, data);
  },

  put: function(url, data) {
    return this.request('PUT', url, data);
  },

  delete_: function(url, data) {
    var url_encoded_data = jQuery.param(this.stringify_json_data(data));
    return this.request('DELETE', url + "?" + url_encoded_data);
  },

  request: function(type, url, data) {
    var future = new Monarch.Http.AjaxFuture();
    jQuery.ajax({
      url: url,
      type: type,
      dataType: 'json',
      data: data ? this.stringify_json_data(data) : null,
      success: function(response) {
        future.handle_response(response);
      }
    });
    return future;
  },

  stringify_json_data: function(data) {
    var stringified_data = {};
    Monarch.Util.each(data, function(key, value) {
      if (typeof value == "object") value = JSON.stringify(value);
      stringified_data[key] = value;
    });
    return stringified_data;
  }
});

})(Monarch, jQuery);

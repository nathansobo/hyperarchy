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

  subscribe: function(relations) {
    return null;
  },

  save: function() {
    var commands = Monarch.Util.map(this.extract_dirty_records(arguments), function(dirty_record) {
      return this.build_appropriate_command(dirty_record);
    }.bind(this));
    var batch = new Monarch.Http.CommandBatch(this, commands);
    return batch.perform();
  },

  post: function(url, data) {
    return this.request('POST', url, this.add_comet_id(data));
  },

  get: function(url, data) {
    return this.request('GET', url, this.add_comet_id(data));
  },

  put: function(url, data) {
    return this.request('PUT', url, this.add_comet_id(data));
  },

  delete_: function(url, data) {
    var url_encoded_data = jQuery.param(this.stringify_json_data(this.add_comet_id(data)));
    return this.request('DELETE', url + "?" + url_encoded_data);
  },

  // private

  add_comet_id: function(data) {
    return Monarch.Util.extend({ comet_client_id: window.COMET_CLIENT_ID }, data);
  },

  extract_dirty_records: function(records_or_relations) {
    var dirty_records = []
    Monarch.Util.each(records_or_relations, function(arg) {
      if (arg.__relation__) {
        dirty_records.push.apply(dirty_records, arg.dirty_tuples());
      } else {
        if (arg.dirty()) dirty_records.push(arg);
      }
    });
    return dirty_records;
  },

  build_appropriate_command: function(record) {
    if (record.locally_destroyed) {
      return new Monarch.Http.DestroyCommand(record);
    } else if (!record.remotely_created) {
      return new Monarch.Http.CreateCommand(record);
    } else {
      return new Monarch.Http.UpdateCommand(record);
    }
  },

  request: function(type, url, data) {
    var future = new Monarch.Http.AjaxFuture();
    jQuery.ajax({
      url: url,
      type: type,
      dataType: 'json',
      data: this.stringify_json_data(data),
      success: function(response) {
        future.handle_response(response);
      }
    });
    return future;
  },

  stringify_json_data: function(data) {
    if (!data) return null;
    var stringified_data = {};
    Monarch.Util.each(data, function(key, value) {
      if (typeof value != "string") value = JSON.stringify(value);
      stringified_data[key] = value;
    });
    return stringified_data;
  }
});

})(Monarch, jQuery);

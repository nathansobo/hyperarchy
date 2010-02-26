(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Http.Server", {
  comet_hub_url: "/comet",

  initialize: function() {
    this.pending_commands = [];
  },

  fetch: function(relations) {
    var fetch_future = new Monarch.Http.RepositoryUpdateFuture();

    this.get(Repository.origin_url + "/fetch", {
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
    if (!this.comet_client) {
      this.comet_client = this.new_comet_client();
      this.comet_client.connect();
      this.comet_client.on_receive(function(mutation) {
        if (window.debug_events) console.debug(mutation);
        Repository.mutate([mutation]);
      });
    }

    var subscribe_future = new Monarch.Http.AjaxFuture();
    this.post(Repository.origin_url + "/subscribe", {
      relations: Monarch.Util.map(relations, function(relation) {
        return relation.wire_representation();
      })
    }).on_success(function(subscription_ids) {
      subscribe_future.trigger_success(Monarch.Util.map(subscription_ids, function(subscription_id, index) {
        return new Monarch.Http.RemoteSubscription(subscription_id, relations[index]);
      }));
    });

    return subscribe_future;
  },

  unsubscribe: function(remote_subscriptions) {
    return this.post(Repository.origin_url + "/unsubscribe", {
      subscription_ids: Monarch.Util.map(remote_subscriptions, function(remote_subscription) {
        return remote_subscription.id;
      })
    });
  },

  save: function() {
    var commands = Monarch.Util.map(this.extract_dirty_records(arguments), function(dirty_record) {
      return this.build_appropriate_command(dirty_record);
    }.bind(this));
    var batch = new Monarch.Http.CommandBatch(this, commands);

    Repository.pause_mutations();
    var save_future = batch.perform();
    save_future.on_complete(function() {
      Repository.resume_mutations();
    });
    return save_future;
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
  new_comet_client: function() {
    return new Monarch.Http.CometClient();
  },

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
    } else if (!record.is_remotely_created) {
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

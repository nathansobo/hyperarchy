constructor("Http.Server", {
  fetch: function(relations) {
    var fetch_future = new Http.RepositoryUpdateFuture();

    start = new Date().getTime();

    Server.get(Repository.origin_url, {
      relations: Util.map(relations, function(relation) {
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

  create: function(relation, field_values) {
    return this.post(Repository.origin_url, {
      relation: relation.wire_representation(),
      field_values: field_values
    });
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

  request: function(type, url, data) {
    var future = new Http.AjaxFuture();
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
    var stringified_data = {};
    Util.each(data, function(key, value) {
      if (typeof value == "object") value = JSON.stringify(value);
      stringified_data[key] = value;
    });
    return stringified_data;
  }
});

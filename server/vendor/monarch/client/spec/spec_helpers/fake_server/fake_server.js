Monarch.constructor("FakeServer", Monarch.Http.Server, {
  initialize: function(auto) {
    this.posts = [];
    this.puts = [];
    this.deletes = [];
    this.gets = [];
    this.fetches = [];
    this.creates = [];
    this.updates = [];
    this.destroys = [];
    this.batches = [];

    this.auto = (auto === undefined) ? true : auto;

    this.Repository = Repository.clone_schema();

    this.id_counter = 1;
  },

  fetch: function(relations) {
    var fake_fetch = new FakeServer.FakeFetch(Repository.origin_url, relations, this.Repository);
    if (this.auto) {
      fake_fetch.simulate_success();
    } else {
      this.last_fetch = fake_fetch;
      this.fetches.push(fake_fetch);
    }
    return fake_fetch.future;
  },

  auto_fetch: function(relations) {
    var prev_auto_value = this.auto;
    this.auto = true;
    this.fetch(relations);
    this.auto = prev_auto_value;
  },

  save: function() {
    var commands = Monarch.Util.map(this.extract_dirty_records(arguments), function(dirty_record) {
      return this.build_appropriate_command(dirty_record);
    }.bind(this));
    var batch = new FakeServer.FakeCommandBatch(Repository.origin_url, this, commands);
    return batch.perform();
  },

  post: function(url, data) {
    return this.request('post', url, data);
  },

  get: function(url, data) {
    return this.request('get', url, data);
  },

  put: function(url, data) {
    return this.request('put', url, data);
  },

  delete_: function(url, data) {
    return this.request('delete', url, data);
  },

  remove_request: function(request) {
    var requests_array = this[Monarch.Inflection.pluralize(request.type)];
    Monarch.Util.remove(requests_array, request);
    this["last_" + request.type] = requests_array[requests_array.length - 1];
  },

  // private

  request: function(type, url, data) {
    var fake_request = new FakeServer.FakeRequest(type, url, data, this);
    this.add_request(fake_request);
    return fake_request.future;
  },

  add_request: function(request) {
    var requests_array = this[Monarch.Inflection.pluralize(request.type)];
    requests_array.push(request);
    this["last_" + request.type] = request;
  }
});

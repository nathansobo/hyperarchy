Monarch.constructor("FakeServer", {
  initialize: function() {
    this.posts = [];
    this.puts = [];
    this.deletes = [];
    this.gets = [];
    this.fetches = [];
    this.creates = [];
    this.updates = [];
    this.destroys = [];
    this.batches = [];

    this.auto_fetch = false;
    this.auto_mutate = false;

    this.Repository = Repository.clone_schema();
  },

  fetch: function(relations) {
    var fake_fetch = new FakeServer.FakeFetch(Repository.origin_url, relations, this.Repository);
    if (this.auto_fetch) {
      fake_fetch.simulate_success();
    } else {
      this.last_fetch = fake_fetch;
      this.fetches.push(fake_fetch);
    }
    return fake_fetch.future;
  },

  simulate_fetch: function(relations) {
    this.fetch(relations);
    if (!this.auto_fetch) this.fetches.shift().simulate_success();
  },

  create: function(table, field_values) {
    return this.mutate(new Monarch.Http.CreateCommand(table, field_values));
  },

  update: function(record, field_values) {
    return this.mutate(new Monarch.Http.UpdateCommand(record, field_values));
  },

  destroy: function(record) {
    return this.mutate(new Monarch.Http.DestroyCommand(record));
  },

  mutate: function(command) {
    var fake_mutatation =  new FakeServer.FakeMutation(Repository.origin_url, command, this)

    if (this.batch_in_progress) {
      this.current_batch.add_mutation(fake_mutatation);
    } else {
      this.start_batch();
      this.current_batch.add_mutation(fake_mutatation);
      this.finish_batch();

      if (this.auto_mutate) {
        this.last_batch.simulate_success();
      } else {
        this["last_" + fake_mutatation.type] = fake_mutatation;
        this[fake_mutatation.type + "s"].push(fake_mutatation);
      }
    }
    return fake_mutatation.future;
  },

  start_batch: function() {
    if (this.batch_in_progress) throw new Error("Batch already in progress");
    this.batch_in_progress = true;
    this.current_batch = new FakeServer.FakeBatch(this);
  },

  finish_batch: function() {
    if (!this.batch_in_progress) throw new Error("No batch in progress");
    this.last_batch = this.current_batch;
    this.batches.push(this.current_batch);
    this.current_batch = null;
    this.batch_in_progress = false;
  },

  post: function(url, data) {
    var fake_post = new FakeServer.FakeRequest('POST', url, data)
    this.last_post = fake_post;
    this.posts.push(fake_post);
    return fake_post.future;
  },

  get: function(url, data) {
    var fake_get = new FakeServer.FakeRequest('GET', url, data)
    this.last_get = fake_get;
    this.gets.push(fake_get);
    return fake_get.future;
  },

  put: function(url, data) {
    var fake_put = new FakeServer.FakeRequest('PUT', url, data)
    this.last_put = fake_put;
    this.puts.push(fake_put);
    return fake_put.future;
  },

  delete_: function(url, data) {
    var fake_delete = new FakeServer.FakeRequest('DELETE', url, data)
    this.last_delete = fake_delete;
    this.deletes.push(fake_delete);
    return fake_delete.future;
  },

  remove_request: function(request) {
    var requests_array = this[Monarch.Inflection.pluralize(request.type)];

    Monarch.Util.remove(requests_array, request);
    this["last_" + request.type] = requests_array[requests_array.length - 1];
  }
});

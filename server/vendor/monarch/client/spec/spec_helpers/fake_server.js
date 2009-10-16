Screw.Unit(function(c) {
  c.use_fake_server = function() {
    var original_server;

    c.init(function() {
      original_server = Server;
      Server = new FakeServer();
    });

    c.after(function() {
      Server = original_server;
    })
  };
});

Monarch.constructor("FakeServer", {
  initialize: function() {
    this.posts = [];
    this.puts = [];
    this.deletes = [];
    this.gets = [];
    this.fetches = [];
    this.creates = [];
    this.auto_fetch = false;

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

  create: function(relation, field_values) {
    var fake_create = new FakeServer.FakeCreate(Repository.origin_url, relation, field_values);
    if (this.auto_create) {
      fake_create.simulate_success();
    } else {
      this.last_create = fake_create;
      this.creates.push(fake_create);
    }
    return fake_create.future;
  },

  simulate_fetch: function(relations) {
    this.fetch(relations);
    if (!this.auto_fetch) this.fetches.shift().simulate_success();
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
  }
});

Monarch.constructor("FakeServer.FakeRequest", {
  initialize: function(type, url, data) {
    this.future = new Monarch.Http.AjaxFuture();
    this.type = type;
    this.url = url;
    this.data = data;
  },

  simulate_success: function(data) {
    this.future.handle_response({
      successful: true,
      data: data
    });
  },

  simulate_failure: function(data) {
    this.future.handle_response({
      successful: false,
      data: data
    });
  }
});

Monarch.constructor("FakeServer.FakeFetch", {
  initialize: function(url, relations, fixture_repository) {
    this.url = url;
    this.relations = relations;
    this.fixture_repository = fixture_repository;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
  },

  simulate_success: function() {
    var dataset = this.fetch_dataset_from_fixture_repository();
    Repository.pause_events();
    Repository.update(dataset);
    this.future.trigger_before_events();
    Repository.resume_events();
    this.future.trigger_after_events();
  },

  fetch_dataset_from_fixture_repository: function() {
    var self = this;
    var dataset = {};
    Monarch.Util.each(this.relations, function(relation) {
      self.add_relation_to_dataset(relation, dataset);
    });
    return dataset;
  },

  add_relation_to_dataset: function(relation, dataset) {
    var records = relation.evaluate_in_repository(this.fixture_repository).records();
    var table_name = relation.primary_table().global_name;

    if (!dataset[table_name]) dataset[table_name] = {};
    Monarch.Util.each(records, function(record) {
      dataset[table_name][record.id()] = record.wire_representation();
    });
  }
});

Monarch.constructor("FakeServer.FakeCreate", {
  constructor_initialize: function() {
    this.id_counter = 1;
  },

  initialize: function(url, relation, field_values) {
    this.url = url;
    this.relation = relation;
    this.field_values = field_values;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
  },

  simulate_success: function() {
    var self = this;
    var field_values = jQuery.extend({}, this.field_values, {id: (this.constructor.id_counter++).toString()});
    var new_record = new this.relation.record_constructor(field_values);

    this.relation.insert(new_record, {
      before_events: function() { self.future.trigger_before_events(new_record); },
      after_events: function() { self.future.trigger_after_events(new_record); }
    });
  }
});

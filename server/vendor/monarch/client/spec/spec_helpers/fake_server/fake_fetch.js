Monarch.constructor("FakeServer.FakeFetch", {
  type: 'fetch',

  initialize: function(url, relations, fake_server) {
    this.url = url;
    this.relations = relations;
    this.fake_server = fake_server;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
  },

  simulate_success: function() {
    var dataset = this.fetch_dataset_from_fixture_repository();
    Repository.pause_events();
    Repository.update(dataset);
    this.future.trigger_before_events();
    Repository.resume_events();
    this.future.trigger_after_events();
    this.fake_server.remove_request(this);
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
    var tuples = relation.evaluate_in_repository(this.fake_server.Repository).tuples();
    var table_name = relation.primary_table().global_name;

    if (!dataset[table_name]) dataset[table_name] = {};
    Monarch.Util.each(tuples, function(record) {
      dataset[table_name][record.id()] = record.wire_representation();
    });
  }
});

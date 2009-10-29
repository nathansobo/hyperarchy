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

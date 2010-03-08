Monarch.constructor("FakeServer.FakeFetch", {
  type: 'fetch',

  initialize: function(url, relations, fakeServer) {
    this.url = url;
    this.relations = relations;
    this.fakeServer = fakeServer;
    this.future = new Monarch.Http.RepositoryUpdateFuture();
  },

  simulateSuccess: function() {
    var dataset = this.fetchDatasetFromFixtureRepository();
    Repository.pauseEvents();
    Repository.update(dataset);
    this.future.triggerBeforeEvents();
    Repository.resumeEvents();
    this.future.triggerAfterEvents();
    this.fakeServer.removeRequest(this);
  },

  fetchDatasetFromFixtureRepository: function() {
    var self = this;
    var dataset = {};
    _.each(this.relations, function(relation) {
      self.addRelationToDataset(relation, dataset);
    });
    return dataset;
  },

  addRelationToDataset: function(relation, dataset) {
    var tuples = relation.evaluateInRepository(this.fakeServer.Repository).tuples();
    var tableName = relation.primaryTable().globalName;

    if (!dataset[tableName]) dataset[tableName] = {};
    _.each(tuples, function(record) {
      dataset[tableName][record.id()] = record.wireRepresentation();
    });
  }
});

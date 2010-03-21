_.constructor("FakeServer.FakeFetch", {
  type: 'fetch',

  initialize: function(url, relations, fakeServer) {
    this.url = url;
    this.relations = relations;
    this.fakeServer = fakeServer;
    this.future = new Monarch.Http.AjaxFuture();
  },

  simulateSuccess: function() {
    this.future.handleResponse({
      successful: true,
      dataset: this.fetchDatasetFromFixtureRepository()
    })
    this.fakeServer.removeRequest(this);
  },

  fetchDatasetFromFixtureRepository: function() {
    var dataset = {};
    _.each(this.relations, function(relation) {
      this.addRelationToDataset(relation, dataset);
    }, this);
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

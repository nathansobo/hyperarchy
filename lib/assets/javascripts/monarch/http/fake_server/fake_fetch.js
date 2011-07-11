_.constructor("Monarch.Http.FakeServer.FakeFetch", {
  type: 'fetch',

  initialize: function(url, relations, fakeServer) {
    this.url = url;
    this.relations = relations;
    this.fakeServer = fakeServer;
    this.future = new Monarch.Http.AjaxFuture();
  },

  simulateSuccess: function(dataset) {
    this.future.handleResponse({
      successful: true,
      dataset: dataset || this.fetchDatasetFromFixtureRepository()
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
    var tableName = relation.surfaceTables()[0].globalName;

    if (!dataset[tableName]) dataset[tableName] = {};
    _.each(tuples, function(record) {
      dataset[tableName][record.id()] = record.wireRepresentation();
    });
  }
});

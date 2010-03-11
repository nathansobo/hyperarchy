constructor("Candidate", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      electionId: 'key',
      body: 'string'
    });
  }
});

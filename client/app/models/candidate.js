constructor("Candidate", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      electionId: 'string',
      body: 'string'
    });
  }
});

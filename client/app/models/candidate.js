constructor("Candidate", Model.Record, {
  constructor_initialize: function() {
    this.columns({
      election_id: 'string',
      body: 'string'
    });
  }
});

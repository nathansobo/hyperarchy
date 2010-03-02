constructor("Election", Model.Record, {
  constructor_initialize: function() {
    this.columns({
      organization_id: 'string',
      body: 'string'
    });

    this.has_many('candidates');
  }
});

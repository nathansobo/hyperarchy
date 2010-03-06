constructor("Election", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: 'string',
      body: 'string'
    });

    this.hasMany('candidates');
  }
});

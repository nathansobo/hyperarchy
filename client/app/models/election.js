constructor("Election", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      organizationId: 'key',
      body: 'string'
    });

    this.hasMany('candidates');
  }
});

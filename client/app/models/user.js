_.constructor("User", Model.Record, {
  constructorInitialize: function() {
    this.columns({
      full_name: 'string'
    });

    this.hasMany('rankings');
  }
});

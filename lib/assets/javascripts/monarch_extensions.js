_.addMethods(Monarch.Model.Record.prototype, {
  mixpanelProperties: function() {
    var properties = this.wireRepresentation();
    var note = this.mixpanelNote();
    if (note) properties = _.extend(properties, {mp_note: note});
    return properties;
  },

  trackView: function() {
    mpq.push(["track", "View " + this.constructor.basename, this.mixpanelProperties()]);
  },

  trackCreate: function() {
    mpq.push(["track", "Create " + this.constructor.basename, this.mixpanelProperties()]);
  },

  trackUpdate: function() {
    mpq.push(["track", "Update " + this.constructor.basename, this.mixpanelProperties()]);
  },

  mixpanelNote: function() {}
});

(function(Monarch) {

Monarch.constructor("Monarch.Http.RemoteSubscription", {
  initialize: function(subscriptionId, relation) {
    this.id = subscriptionId;
    this.relation = relation;
  },

  destroy: function() {
    return Server.unsubscribe([this]);
  }
});

})(Monarch);

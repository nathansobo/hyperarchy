(function(Monarch) {

Monarch.constructor("Monarch.Http.RemoteSubscription", {
  initialize: function(subscription_id, relation) {
    this.id = subscription_id;
    this.relation = relation;
  },

  destroy: function() {
    return Server.unsubscribe([this]);
  }
});

})(Monarch);

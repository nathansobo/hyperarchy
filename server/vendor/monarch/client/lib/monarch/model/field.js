(function(Monarch) {

Monarch.constructor("Monarch.Model.Field", {
  onUpdate: function(updateCallback) {
    if (!this.onUpdateNode) this.onUpdateNode = new Monarch.SubscriptionNode();
    return this.onUpdateNode.subscribe(updateCallback);
  }
});

})(Monarch);

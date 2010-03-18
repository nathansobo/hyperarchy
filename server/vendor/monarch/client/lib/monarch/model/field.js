(function(Monarch) {

Monarch.constructor("Monarch.Model.Field", {
  onUpdate: function(updateCallback, context) {
    if (!this.onUpdateNode) this.onUpdateNode = new Monarch.SubscriptionNode();
    return this.onUpdateNode.subscribe(updateCallback, context);
  }
});

})(Monarch);

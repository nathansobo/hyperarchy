(function(Monarch) {

Monarch.constructor("Monarch.Model.RelationDefinition", {
  initialize: function(name, definition) {
    this.name = name;
    this.definition = definition;
  },

  extend: function(extensionHash) {
    this.extensionHash = extensionHash;
    return this;
  },

  build: function(parentRecord) {
    var relation = this.definition.call(parentRecord);
    if (this.extensionHash) _.extend(relation, this.extensionHash);
    return relation;
  }
});

})(Monarch);
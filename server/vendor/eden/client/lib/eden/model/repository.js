module("Model.RemoteRepository", {
  remote_create: function(relation, field_values) {
    return Server.post(this.origin_url, {
      relation: relation.wire_representation(),
      field_values: field_values
    });
  }
});

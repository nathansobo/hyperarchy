(function(Monarch, jQuery) {

_.constructor("Monarch.Http.Server", {
  sandboxUrl: '/sandbox',

  fetch: function() {
    var relationWireRepresentations = _.map(arguments, function(arg) {
      return arg.wireRepresentation();
    });

    var promise = new Monarch.Promise();

    jQuery.ajax({
      url: this.sandboxUrl,
      type: 'get',
      data: { relations: JSON.stringify(relationWireRepresentations) },
      success: function(records) {
        Repository.update(records);
        promise.triggerSuccess();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        promise.triggerError(jqXhr, textStatus, errorThrown);
      }
    });

    return promise;
  },

  create: function(record) {
    var promise = new Monarch.Promise();
    Repository.pauseMutations();

    jQuery.ajax({
      url: this.sandboxUrl + '/' + record.table.globalName,
      type: 'post',
      data: { field_values: record.wireRepresentation() },
      success: function(fieldValues) {
        record.remotelyCreated(fieldValues);
        promise.triggerSuccess(record);
        Repository.resumeMutations();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        if (jqXhr.status === 422) {
          record.assignValidationErrors(JSON.parse(jqXhr.responseText));
          promise.triggerInvalid(record);
        } else {
          promise.triggerError(jqXhr, textStatus, errorThrown);
        }
        Repository.resumeMutations();
      }
    });

    return promise;
  },

  update: function(record) {
    var promise = new Monarch.Promise();
    Repository.pauseMutations();

    var pendingVersion = record.nextPendingVersion();

    jQuery.ajax({
      url: this.sandboxUrl + '/' + record.table.globalName + '/' + record.id(),
      type: 'put',
      data: { field_values: record.dirtyWireRepresentation() },
      success: function(fieldValues) {
        var changeset = record.remotelyUpdated(fieldValues, pendingVersion);
        promise.triggerSuccess(record, changeset);
        Repository.resumeMutations();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        if (jqXhr.status === 422) {
          record.assignValidationErrors(JSON.parse(jqXhr.responseText));
          promise.triggerInvalid(record);
        } else {
          promise.triggerError(jqXhr, textStatus, errorThrown);
        }
        Repository.resumeMutations();
      }
    });

    return promise;
  },

  destroy: function(record) {
    var promise = new Monarch.Promise();
    Repository.pauseMutations();

    jQuery.ajax({
      url: this.sandboxUrl + '/' + record.table.globalName + '/' + record.id(),
      type: 'delete',
      success: function() {
        var changeset = record.remotelyDestroyed();
        promise.triggerSuccess(record);
        Repository.resumeMutations();
      },
      error: function(jqXhr, textStatus, errorThrown) {
        promise.triggerError(jqXhr, textStatus, errorThrown);
        Repository.resumeMutations();
      }
    });

    return promise;
  }
});

})(Monarch, jQuery);

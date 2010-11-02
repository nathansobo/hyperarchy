(function(Monarch, jQuery) {

_.constructor("Monarch.Http.Server", {
  cometHubUrl: "/comet",

  initialize: function() {
    this.pendingCommands = [];
  },

  realTimeClientId: {
    afterWrite: function() {
      this.connectRealTimeClient();
    }
  },

  connectRealTimeClient: function() {
    if (this.realTimeClient) throw new Error("Real time client already connected.");
    this.realTimeClient = this.newRealTimeClient();
    this.realTimeClient.onReceive(function(mutation) {
      if (window.debugEvents) console.debug(_.clone(mutation));
      Repository.mutate([mutation]);
    });
    this.realTimeClient.connect();
  },

  fetch: function(relations) {
    return this.get(Repository.originUrl + "/fetch", {
      relations: _.map(relations, function(relation) {
        if (!relation.wireRepresentation) debugger;
        return relation.wireRepresentation();
      })
    });
  },

  subscribe: function(relations) {
    var subscribeFuture = new Monarch.Http.AjaxFuture();

    this.post(Repository.originUrl + "/subscribe", {
      real_time_client_id: this.realTimeClientId(),
      relations: _.map(relations, function(relation) {
        if (relation.isA(Monarch.Model.Record)) {
          return relation.table.where({id: relation.id()}).wireRepresentation();
        } else {
          return relation.wireRepresentation();
        }
      })
    }).onSuccess(function(subscriptionIds) {
      subscribeFuture.triggerSuccess(_.map(subscriptionIds, function(subscriptionId, index) {
        return new Monarch.Http.RemoteSubscription(subscriptionId, relations[index]);
      }));
    });

    return subscribeFuture;
  },

  unsubscribe: function(remoteSubscriptions) {
    return this.post(Repository.originUrl + "/unsubscribe", {
      real_time_client_id: this.realTimeClientId(),
      subscription_ids: _.map(remoteSubscriptions, function(remoteSubscription) {
        return remoteSubscription.id;
      })
    });
  },

  save: function() {
    var commands = _.map(this.extractDirtyRecords(arguments), function(dirtyRecord) {
      return this.buildAppropriateCommand(dirtyRecord);
    }, this);


    if (_.isEmpty(commands)) {
      var saveFuture = new Monarch.Http.AjaxFuture();
      saveFuture.updateRepositoryAndTriggerCallbacks(this.firstRecord(arguments), _.identity);
      return saveFuture;
    } else {
      var batch = new Monarch.Http.CommandBatch(this, commands);
      Repository.pauseMutations();
      var saveFuture = batch.perform();
      saveFuture.onComplete(function() {
        Repository.resumeMutations();
      });

      return saveFuture;
    }
  },

  post: function(url, data) {
    return this.request('POST', url, data);
  },

  get: function(url, data) {
    return this.request('GET', url, data);
  },

  put: function(url, data) {
    return this.request('PUT', url, data);
  },

  delete_: function(url, data) {
    var urlEncodedData = jQuery.param(this.stringifyJsonData(data));
    return this.request('DELETE', url + "?" + urlEncodedData);
  },

  // private
  newRealTimeClient: function() {
    return new Monarch.Http.CometClient(this.realTimeClientId());
  },

  extractDirtyRecords: function(recordsOrRelations) {
    var dirtyRecords = []
    _.each(recordsOrRelations, function(arg) {
      if (arg._relation_) {
        dirtyRecords.push.apply(dirtyRecords, arg.dirtyTuples());
      } else {
        if (arg.dirty()) dirtyRecords.push(arg);
      }
    });
    return dirtyRecords;
  },

  firstRecord: function(recordsOrRelations) {
    var first = recordsOrRelations[0];
    if (first._relation_) {
      return first.first();
    } else {
      return first;
    }
  },

  buildAppropriateCommand: function(record) {
    if (record.locallyDestroyed) {
      return new Monarch.Http.DestroyCommand(record);
    } else if (!record.isRemotelyCreated) {
      return new Monarch.Http.CreateCommand(record);
    } else {
      return new Monarch.Http.UpdateCommand(record);
    }
  },

  request: function(type, url, data) {
    var future = new Monarch.Http.AjaxFuture();
    jQuery.ajax({
      url: url,
      type: type,
      dataType: 'json',
      data: this.stringifyJsonData(data),
      success: function(response) {
        if (!response) throw new Error("Ajax response was null for url ", url);
        future.handleResponse(response);
      },
      error: function(xhr, status, errorThrown) {
        future.triggerError(xhr, status, errorThrown);
      }
    });
    return future;
  },

  stringifyJsonData: function(data) {
    if (!data) return null;
    var stringifiedData = {};
    _.each(data, function(value, key) {
      if (typeof value != "string") value = JSON.stringify(value);
      stringifiedData[key] = value;
    });
    return stringifiedData;
  }
});

})(Monarch, jQuery);

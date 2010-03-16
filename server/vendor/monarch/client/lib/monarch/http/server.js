(function(Monarch, jQuery) {

Monarch.constructor("Monarch.Http.Server", {
  cometHubUrl: "/comet",

  initialize: function() {
    this.pendingCommands = [];
  },

  fetch: function(relations) {
    return this.get(Repository.originUrl + "/fetch", {
      relations: _.map(relations, function(relation) {
        return relation.wireRepresentation();
      })
    });
  },

  subscribe: function(relations) {
    if (!this.cometClient) {
      this.cometClient = this.newCometClient();
      this.cometClient.connect();
      this.cometClient.onReceive(function(mutation) {
        if (window.debugEvents) console.debug(mutation);
        Repository.mutate([mutation]);
      });
    }

    var subscribeFuture = new Monarch.Http.AjaxFuture();
    this.post(Repository.originUrl + "/subscribe", {
      relations: _.map(relations, function(relation) {
        return relation.wireRepresentation();
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
      subscriptionIds: _.map(remoteSubscriptions, function(remoteSubscription) {
        return remoteSubscription.id;
      })
    });
  },

  save: function() {
    var commands = _.map(this.extractDirtyRecords(arguments), function(dirtyRecord) {
      return this.buildAppropriateCommand(dirtyRecord);
    }.bind(this));
    var batch = new Monarch.Http.CommandBatch(this, commands);

    Repository.pauseMutations();
    var saveFuture = batch.perform();
    saveFuture.onComplete(function() {
      Repository.resumeMutations();
    });
    return saveFuture;
  },

  post: function(url, data) {
    return this.request('POST', url, this.addCometId(data));
  },

  get: function(url, data) {
    return this.request('GET', url, this.addCometId(data));
  },

  put: function(url, data) {
    return this.request('PUT', url, this.addCometId(data));
  },

  delete_: function(url, data) {
    var urlEncodedData = jQuery.param(this.stringifyJsonData(this.addCometId(data)));
    return this.request('DELETE', url + "?" + urlEncodedData);
  },

  // private
  newCometClient: function() {
    return new Monarch.Http.CometClient();
  },

  addCometId: function(data) {
    return _.extend({ cometClientId: window.COMET_CLIENT_ID }, data);
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
        future.handleResponse(response);
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

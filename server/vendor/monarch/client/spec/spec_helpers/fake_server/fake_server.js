_.constructor("FakeServer", Monarch.Http.Server, {
  initialize: function(auto) {
    this.posts = [];
    this.puts = [];
    this.deletes = [];
    this.gets = [];
    this.fetches = [];
    this.subscribes = [];
    this.unsubscribes = [];
    this.creates = [];
    this.updates = [];
    this.destroys = [];
    this.batches = [];

    this.auto = (auto === undefined) ? true : auto;

    this.Repository = Repository.cloneSchema();

    this.idCounter = 1;
  },

  fetch: function(relations) {
    var fakeFetch = new FakeServer.FakeFetch(Repository.originUrl, relations, this);
    if (this.auto) {
      fakeFetch.simulateSuccess();
    } else {
      this.lastFetch = fakeFetch;
      this.fetches.push(fakeFetch);
    }
    return fakeFetch.future;
  },

  autoFetch: function(relations) {
    var prevAutoValue = this.auto;
    this.auto = true;
    this.fetch(relations);
    this.auto = prevAutoValue;
  },

  subscribe: function(relations) {
    var fakeSubscribe = new FakeServer.FakeSubscribe(Repository.originUrl, relations, this);

    if (this.auto) {
      fakeSubscribe.simulateSuccess();
    } else {
      this.subscribes.push(fakeSubscribe);
      this.lastSubscribe = fakeSubscribe;
    }
    return fakeSubscribe.future;
  },

  unsubscribe: function(remoteSubscriptions) {
    var fakeUnsubscribe = new FakeServer.FakeUnsubscribe(Repository.originUrl, remoteSubscriptions, this);

    if (this.auto) {
      fakeUnsubscribe.simulateSuccess();
    } else {
      this.unsubscribes.push(fakeUnsubscribe);
      this.lastUnsubscribe = fakeUnsubscribe;
      return fakeUnsubscribe.future;
    }
  },
  
  save: function() {
    var commands = _.map(this.extractDirtyRecords(arguments), function(dirtyRecord) {
      return this.buildAppropriateCommand(dirtyRecord);
    }, this);
    var batch = new FakeServer.FakeCommandBatch(Repository.originUrl, this, commands);
    return batch.perform();
  },

  post: function(url, data) {
    return this.request('post', url, data);
  },

  get: function(url, data) {
    return this.request('get', url, data);
  },

  put: function(url, data) {
    return this.request('put', url, data);
  },

  delete_: function(url, data) {
    return this.request('delete', url, data);
  },

  removeRequest: function(request) {
    var requestsArray = this[_.pluralize(request.type)];
    _.remove(requestsArray, request);
    this["last" + _.capitalize(request.type)] = requestsArray[requestsArray.length - 1];
  },

  // private

  request: function(type, url, data) {
    var fakeRequest = new FakeServer.FakeRequest(type, url, data, this);
    this.addRequest(fakeRequest);
    return fakeRequest.future;
  },

  addRequest: function(request) {
    var requestsArray = this[_.pluralize(request.type)];
    requestsArray.push(request);
    this["last" + _.capitalize(request.type)] = request;
  }
});

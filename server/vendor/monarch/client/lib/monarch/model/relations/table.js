(function(Monarch) {

_.constructor("Monarch.Model.Relations.Table", Monarch.Model.Relations.Relation, {
  hasOperands: false,

  initialize: function(globalName, recordConstructor) {
    this.globalName = globalName;
    this.recordConstructor = recordConstructor;
    this.columnsByName = {};
    this.syntheticColumnsByName = {};
    this._tuples = [];
    this.tuplesById = {};

    this.initializeEventsSystem();
    this.onPauseEventsNode = new Monarch.SubscriptionNode();
    this.onResumeEventsNode = new Monarch.SubscriptionNode();
  },

  defineColumn: function(name, type) {
    return this.columnsByName[name] = new Monarch.Model.Column(this, name, type);
  },

  defineSyntheticColumn: function(name, definition) {
    return this.syntheticColumnsByName[name] = new Monarch.Model.SyntheticColumn(this, name, definition);
  },

  create: function(fieldValues) {
    var record = this.localCreate(fieldValues);
    return Server.save(record);
  },

  localCreate: function(fieldValues) {
    var record = new this.recordConstructor(fieldValues, this);
    record.isRemotelyCreated = false;
    this.insert(record);
    if (record.afterLocalCreate) record.afterLocalCreate();
    return record;
  },

  createFromRemote: function(fieldValues) {
    var record = new this.recordConstructor(null, this);
    this.insert(record);
    record.remotelyCreated(fieldValues);
    return record;
  },

  remove: function(record) {
    delete this.tuplesById[record.id()];
    this.tupleRemovedRemotely(record);
  },

  tupleInsertedRemotely: function(record) {
    this.tuplesById[record.id()] = record;
    this.onRemoteInsertNode.publish(record);
  },

  allTuples: function() {
    return this._tuples.concat();
  },

  find: function(predicateOrId) {
    if (_.isString(predicateOrId) || _.isNumber(predicateOrId)) {
      var record = this.tuplesById[predicateOrId]
      return (record && record.locallyDestroyed) ? null : record;
    } else if (predicateOrId) {
      return this.where(predicateOrId).first();
    } else {
      throw new Error("You called find with null id");
    }
  },

  column: function(name) {
    return this.columnsByName[name];
  },

  surfaceTables: function() {
    return [this];
  },

  wireRepresentation: function() {
    return {
      type: 'table',
      name: this.globalName
    };
  },

  pauseEvents: function() {
    this.onRemoteInsertNode.pauseEvents();
    this.onRemoteRemoveNode.pauseEvents();
    this.onRemoteUpdateNode.pauseEvents();
    this.onPauseEventsNode.publish();
  },

  resumeEvents: function() {
    this.onRemoteInsertNode.resumeEvents();
    this.onRemoteRemoveNode.resumeEvents();
    this.onRemoteUpdateNode.resumeEvents();
    this.onResumeEventsNode.publish();
  },

  onPauseEvents: function(callback, context) {
    return this.onPauseEventsNode.subscribe(callback, context);
  },

  onResumeEvents: function(callback, context) {
    return this.onResumeEventsNode.subscribe(callback, context);
  },
  
  updateContents: function(dataset) {
    _.each(dataset, function(fieldValues, id) {
      var extantRecord = this.find(id);
      if (extantRecord) {
        extantRecord.remotelyUpdated(fieldValues);
      } else {
        this.createFromRemote(fieldValues)
      }
    }, this);
  },
  
  deltaContents: function(dataset) {
    this.each(function(record) {
      if (!dataset[record.id()]) {
        record.remotelyDestroyed();
      }
    });
    this.updateContents(dataset);
  },
  
  loadFixtures: function(fixtureDefinitions) {
    _.each(fixtureDefinitions, function(properties, id) {
      var fieldValues = _.extend({id: id}, properties)
      this.createFromRemote(fieldValues);
    }, this);
  },

  clear: function() {
    this._tuples = [];
    this.tuplesById = {}
    this.onRemoteInsertNode = new Monarch.SubscriptionNode();
    this.onRemoteRemoveNode = new Monarch.SubscriptionNode();
    this.onRemoteUpdateNode = new Monarch.SubscriptionNode();
    this.onPauseEventsNode = new Monarch.SubscriptionNode();
    this.onResumeEventsNode = new Monarch.SubscriptionNode();
  },

  cloneSchema: function() {
    var clone = new Monarch.Model.Relations.Table(this.globalName, this.recordConstructor);
    clone.columnsByName = this.columnsByName;
    return clone;
  },

  evaluateInRepository: function(repository) {
    return repository.tables[this.globalName];
  },

  primaryTable: function() {
    return this;
  },

  // private

  insert: function(record) {
    this._tuples.push(record);
    if (record.id()) this.tuplesById[record.id()] = record;
    record.initializeRelations();
  }
});

})(Monarch);

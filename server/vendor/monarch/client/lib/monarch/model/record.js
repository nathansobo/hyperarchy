(function(Monarch) {

_.constructor("Monarch.Model.Record", {
  constructorProperties: {
    initialize: function() {
      this.delegateConstructorMethods('find', 'fetch', 'tuples', 'first', 'each', 'any', 'onLocalUpdate', 'onRemoteInsert',
                                      'onRemoteUpdate', 'onRemoteRemove', 'where', 'orderBy', 'project', 'difference',
                                      'empty', 'createFromRemote', 'fixture', 'clear', 'table');
    },

    inherited: function(subconstructor) {
      subconstructor.table = new Monarch.Model.Relations.Table(this.determineGlobalName(subconstructor), subconstructor);
      subconstructor.column("id", "key");
      subconstructor.relationDefinitions = [];
      Repository.registerTable(subconstructor.table);
    },

    column: function(name, type) {
      this.generateColumnAccessors(this.table.defineColumn(name, type));
    },

    syntheticColumn: function(name, definition) {
      this.generateColumnAccessors(this.table.defineSyntheticColumn(name, definition));
    },

    columns: function(columnNameTypePairs) {
      for (var name in columnNameTypePairs) {
        this.column(name, columnNameTypePairs[name]);
      }
    },

    relatesToMany: function(name, definition) {
      var relationDefinition = new Monarch.Model.RelationDefinition(name, definition);
      this.relationDefinitions.push(relationDefinition);
      this.prototype[name] = function() {
        return this.relationsByName[name];
      };
      return relationDefinition;
    },

    hasMany: function(relationName, options) {
      var self = this;
      options = options || {};
      var conditions = options.conditions || {};

      var targetTableName = options.table || _.underscore(relationName);
      var foreignKeyColumnName = options.key || _.singularize(this.table.globalName) + "Id";

      return this.relatesToMany(relationName, function() {
        var targetTable = Repository.tables[targetTableName];
        conditions[foreignKeyColumnName] = this.id();
        var relation = targetTable.where(conditions);

        if (options.orderBy) relation = self.processHasManyOrderByOption(relation, options.orderBy);
        return relation;
      });
    },

    belongsTo: function(name) {
      var keyName = name + "Id";
      var tableName = _.underscoreAndPluralize(name);
      this.prototype[name] = function(model) {
        if (arguments.length == 0) {
          var table = Repository.tables[tableName];
          return table.find(this[keyName]());
        } else {
          this[keyName](model.id());
          return model;
        }
      };
    },

    create: function(fieldValues) {
      return this.table.create(fieldValues);
    },

    localCreate: function(fieldValues) {
      return this.table.localCreate(fieldValues);
    },

    humanName: function() {
      return _.humanize(this.basename);
    },

    // private

    generateColumnAccessors: function(column) {
      if (column.name == "name") {
        this["name_"] = column; // name property of functions is read-only in webkit
      } else {
        this[column.name] = column;
      }

      this.prototype[column.name] = function() {
        var field = this.field(column.name);
        return field.value.apply(field, arguments);
      };
    },

    processHasManyOrderByOption: function(relation, orderBy) {
      if (orderBy instanceof Array) {
        return relation.orderBy.apply(relation, orderBy);
      } else {
        return relation.orderBy(orderBy);
      }
    },

    determineGlobalName: function(recordConstructor) {
      return _.pluralize(_.underscore(recordConstructor.basename));
    }
  },

  initialize: function(fieldValuesByColumnName, table) {
    this.table = table;
    this.remote = new Monarch.Model.RemoteFieldset(this);
    this.local = new Monarch.Model.LocalFieldset(this, this.remote);
    this.subscriptions = new Monarch.SubscriptionBundle();
    this.initializeSubscriptionNodes();
    this.subscribeToSelfMutations();
    if (fieldValuesByColumnName) this.localUpdate(fieldValuesByColumnName);
    this.local.updateEventsEnabled = true;
    this.remote.initializeSyntheticFields();
    this.local.initializeSyntheticFields();
    if (this.afterInitialize) this.afterInitialize();
  },

  fetch: function() {
    return this.table.where(this.table.column('id').eq(this.id())).fetch();
  },

  save: function() {
    return Server.save(this);
  },

  localUpdate: function(valuesByMethodName) {
    this.local.beginBatchUpdate();
    for (var methodName in valuesByMethodName) {
      if (this[methodName]) {
        this[methodName](valuesByMethodName[methodName]);
      }
    }
    this.local.finishBatchUpdate();
  },

  localDestroy: function() {
    this.locallyDestroyed = true;
  },

  update: function(valuesByMethodName) {
    this.localUpdate(valuesByMethodName);
    return this.save();
  },

  destroy: function() {
    this.localDestroy();
    return Server.save(this);
  },

  remotelyCreated: function(fieldValues) {
    this.remote.update(_.camelizeKeys(fieldValues));
    this.isRemotelyCreated = true;
    this.remote.updateEventsEnabled = true;
    this.initializeRelations();
    this.table.tupleInsertedRemotely(this);
    this.onRemoteCreateNode.publish(this);
  },

  remotelyUpdated: function(fieldValues) {
    this.remote.update(_.camelizeKeys(fieldValues));
  },

  remotelyDestroyed: function() {
    this.table.remove(this);
    this.onRemoteDestroyNode.publish(this);
  },

  onRemoteUpdate: function(callback, context) {
    return this.onRemoteUpdateNode.subscribe(callback, context);
  },

  onLocalUpdate: function(callback, context) {
    if (!this.onLocalUpdateNode) this.onLocalUpdateNode = new Monarch.SubscriptionNode();
    return this.onLocalUpdateNode.subscribe(callback, context);
  },

  onRemoteDestroy: function(callback, context) {
    return this.onRemoteDestroyNode.subscribe(callback, context);
  },

  onRemoteCreate: function(callback, context) {
    return this.onRemoteCreateNode.subscribe(callback, context)
  },

  onDirty: function(callback, context) {
    if (!this.onDirtyNode) this.onDirtyNode = new Monarch.SubscriptionNode();
    return this.onDirtyNode.subscribe(callback, context);
  },

  onClean: function(callback, context) {
    if (!this.onCleanNode) this.onCleanNode = new Monarch.SubscriptionNode();
    return this.onCleanNode.subscribe(callback, context);
  },

  onInvalid: function(callback, context) {
    if (!this.onInvalidNode) this.onInvalidNode = new Monarch.SubscriptionNode();
    return this.onInvalidNode.subscribe(callback, context);
  },

  onValid: function(callback, context) {
    if (!this.onValidNode) this.onValidNode = new Monarch.SubscriptionNode();
    return this.onValidNode.subscribe(callback, context);
  },

  valid: function() {
    return this.local.valid();
  },

  clearValidationErrors: function() {
    this.local.clearValidationErrors();
  },

  assignValidationErrors: function(errorsByFieldName) {
    this.local.assignValidationErrors(_.camelizeKeys(errorsByFieldName));
    if (this.onInvalidNode) this.onInvalidNode.publish();
  },

  allValidationErrors: function() {
    return this.local.allValidationErrors();
  },

  dirty: function() {
    return this.locallyDestroyed || !this.isRemotelyCreated || this.local.dirty();
  },

  dirtyWireRepresentation: function() {
    return this.local.dirtyWireRepresentation();
  },

  wireRepresentation: function() {
    return this.local.wireRepresentation();
  },

  inspect: function() {
    return this.wireRepresentation();
  },

  field: function(column) {
    return this.local.field(column);
  },

  signal: function(column, optionalTransformer) {
    return this.field(column).signal(optionalTransformer);
  },

  evaluate: function(columnOrConstant) {
    if (columnOrConstant instanceof Monarch.Model.Column) {
      return this.field(columnOrConstant).value();
    } else {
      return columnOrConstant;
    }
  },

  record: function(table) {
    return this.table === table ? this : null;
  },

  pauseEvents: function() {
    this.onRemoteCreateNode.pauseEvents();
    this.onRemoteUpdateNode.pauseEvents();
    this.onRemoteDestroyNode.pauseEvents();
  },

  resumeEvents: function() {
    this.onRemoteCreateNode.resumeEvents();
    this.onRemoteUpdateNode.resumeEvents();
    this.onRemoteDestroyNode.resumeEvents();
  },

  madeDirty: function() {
    if (this.onDirtyNode) this.onDirtyNode.publish();
    this.table.recordMadeDirty(this);
  },

  madeClean: function() {
    if (this.onCleanNode) this.onCleanNode.publish();
    this.table.recordMadeClean(this);
  },

  cleanup: function() {
    this.subscriptions.destroyAll();
  },

  equals: function(other) {
    return this === other;
  },

  hashCode: function() {
    return this.id();
  },

  // private
  initializeSubscriptionNodes: function() {
    this.onRemoteUpdateNode = new Monarch.SubscriptionNode();
    this.onRemoteDestroyNode = new Monarch.SubscriptionNode();
    this.onRemoteCreateNode = new Monarch.SubscriptionNode();

    this.subscriptions.add(this.table.onPauseEvents(function() {
      this.pauseEvents();
    }, this));

    this.subscriptions.add(this.table.onResumeEvents(function() {
      this.resumeEvents();
    }, this));
  },

  subscribeToSelfMutations: function() {
    this.onRemoteCreateNode.subscribe(function(changeset) {
      if (this.afterRemoteCreate) this.afterRemoteCreate();
    }, this);

    this.onRemoteUpdateNode.subscribe(function(changeset) {
      if (this.afterRemoteUpdate) this.afterRemoteUpdate(changeset);
    }, this);

    this.onRemoteDestroyNode.subscribe(function() {
      if (this.afterRemoteDestroy) this.afterRemoteDestroy();
      this.cleanup();
    }, this);
  },

  initializeRelations: function() {
    this.relationsByName = {};
    _.each(this.constructor.relationDefinitions, function(relationDefinition) {
      this.relationsByName[relationDefinition.name] = relationDefinition.build(this);
    }, this);
  }
});

})(Monarch);

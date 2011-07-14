(function(Monarch) {

_.constructor("Monarch.Model.Relations.Relation", {
  numOperands: 1,
  _relation_: true,

  initializeEventsSystem: function() {
    this.onLocalUpdateNode = new Monarch.SubscriptionNode();
    this.onInsertNode = new Monarch.SubscriptionNode();
    this.onUpdateNode = new Monarch.SubscriptionNode();
    this.onRemoveNode = new Monarch.SubscriptionNode();
    this.onDirtyNode = new Monarch.SubscriptionNode();
    this.onCleanNode = new Monarch.SubscriptionNode();
    this.onInvalidNode = new Monarch.SubscriptionNode();
    this.onValidNode = new Monarch.SubscriptionNode();
    if (this.numOperands > 0) {
      this.operandsSubscriptionBundle = new Monarch.SubscriptionBundle();
      this.unsubscribeFromOperandsWhenThisNoLongerHasSubscribers();
    }
  },

  where: function(predicateOrConditionsHash) {
    var predicate;

    if (predicateOrConditionsHash.constructor.isPredicate) {
      predicate = predicateOrConditionsHash;
    } else {
      predicate = this.predicateFromHash(predicateOrConditionsHash);
    }
    return new Monarch.Model.Relations.Selection(this, predicate);
  },

  project: function() {
    var table;
    if (_.isFunction(arguments[0])) {
      table = arguments[0].table;
    } else {
      var surfaceTables = arguments[0].surfaceTables();
      if (surfaceTables.length === 1) {
        table = surfaceTables[0];
      } else {
        throw new Error("Can only project with relations that have a single surface table");
      }
    }

    return new Monarch.Model.Relations.TableProjection(this, table);
  },

  join: function(rightOperand) {
    if (typeof rightOperand === 'function') rightOperand = rightOperand.table;
    var leftOperand = this;
    return {
      on: function(predicate) {
        return new Monarch.Model.Relations.InnerJoin(leftOperand, rightOperand, predicate);
      }
    };
  },

  joinTo: function(rightOperand) {
    if (typeof rightOperand === 'function') rightOperand = rightOperand.table;
    var leftSurfaceTables = this.surfaceTables();
    var rightSurfaceTables = rightOperand.surfaceTables();
    var joinColumns = this.findJoinColumns(_.last(leftSurfaceTables), _.first(rightSurfaceTables));
    return this.join(rightOperand).on(joinColumns[0].eq(joinColumns[1]));
  },

  joinThrough: function(rightOperand) {
    if (typeof rightOperand === 'function') rightOperand = rightOperand.table;
    return this.joinTo(rightOperand).project(rightOperand);
  },

  orderBy: function() {
    var sortSpecifications = this.extractSortSpecsFromArguments(arguments);

    return new Monarch.Model.Relations.Ordering(this, sortSpecifications);
  },

  difference: function(rightOperand) {
    return new Monarch.Model.Relations.Difference(this, rightOperand);
  },

  union: function(rightOperand) {
    return new Monarch.Model.Relations.Union(this, rightOperand);
  },

  offset: function(n) {
    return new Monarch.Model.Relations.Offset(this, n);
  },

  limit: function(n) {
    return new Monarch.Model.Relations.Limit(this, n);
  },

  dirtyTuples: function() {
    return _.filter(this.tuples(), function(record) {
      return record.dirty();
    });
  },

  dirty: function() {
    return this.dirtyTuples().length > 0;
  },

  each: function(fn, context) {
    _.each(this.tuples(), fn, context);
  },

  onEach: function(fn, context) {
    this.each(fn, context);
    return this.onInsert(fn, context);
  },

  map: function(fn, context) {
    return _.map(this.tuples(), fn, context);
  },

  inject: function(initial, fn, context) {
    return _.inject(this.tuples(), initial, fn, context);
  },

  any: function(fn, context) {
    return _.any(this.tuples(), fn, context);
  },

  empty: function() {
    return this.tuples().length == 0;
  },

  first: function() {
    return this.tuples()[0];
  },

  last: function() {
    var tuples = this.tuples();
    return tuples[tuples.length-1];
  },

  find: function(predicateOrIdOrHash) {
    if (_.isString(predicateOrIdOrHash) || _.isNumber(predicateOrIdOrHash)) {
      return this.where(this.column('id').eq(predicateOrIdOrHash)).first();
    } else {
      return this.where(predicateOrIdOrHash).first();
    }
  },

  size: function() {
    return this.tuples().length;
  },

  at: function(i) {
    if (this.storedTuples) {
      return this.storedTuples.at(i);
    } else {
      return this.tuples()[i];
    }
  },

  onInsert: function(callback, context) {
    this.subscribeToOperandsIfNeeded();
    return this.onInsertNode.subscribe(callback, context);
  },

  onUpdate: function(callback, context) {
    this.subscribeToOperandsIfNeeded();
    return this.onUpdateNode.subscribe(callback, context);
  },

  onRemove: function(callback, context) {
    this.subscribeToOperandsIfNeeded();
    return this.onRemoveNode.subscribe(callback, context);
  },

  onDirty: function(callback, context) {
    this.subscribeToOperandsIfNeeded();
    return this.onDirtyNode.subscribe(callback, context);
  },

  onClean: function(callback, context) {
    this.subscribeToOperandsIfNeeded();
    return this.onCleanNode.subscribe(callback, context);
  },

  onInvalid: function(callback, context) {
    this.subscribeToOperandsIfNeeded();
    return this.onInvalidNode.subscribe(callback, context);
  },

  onValid: function(callback, context) {
    this.subscribeToOperandsIfNeeded();
    return this.onValidNode.subscribe(callback, context);
  },

  hasSubscribers: function() {
    return !(this.onInsertNode.empty() && this.onRemoveNode.empty()
        && this.onUpdateNode.empty() && this.onDirtyNode.empty() && this.onCleanNode.empty());
  },

  fetch: function() {
    return Server.fetch(this);
  },

  subscribe: function() {
    return Server.subscribe([this]);
  },

  contains: function(record, changeset) {
    if (this.storedTuples) {
      return this.storedTuples.find(this.buildSortKey(record, changeset)) !== undefined;
    } else {
      return _.indexOf(this.tuples(), record) !== -1;
    }
  },

  findByKey: function(sortKey) {
    return this.storedTuples.find(sortKey);
  },

  indexByKey: function(sortKey) {
    return this.storedTuples.indexOf(sortKey);
  },

  surfaceTables: function() {
    return this.operand.surfaceTables();
  },

  column: function(name) {
    return this.operand.column(name);
  },

  // private

  memoizeTuples: function() {
    var storedTuples = this.buildSkipList();
    this.each(function(tuple) {
      storedTuples.insert(this.buildSortKey(tuple), tuple);
    }, this);
    this.storedTuples = storedTuples;
  },

  buildSkipList: function() {
    if (!this.comparator) this.comparator = this.buildComparator();
    return new Monarch.SkipList(this.comparator);
  },

  buildComparator: function() {
    var sortSpecs = this.sortSpecifications;
    var length = sortSpecs.length;
    var lessThan = _.nullSafeLessThan;

    return function(a, b) {
      for(var i = 0; i < length; i++) {
        var sortSpecification = sortSpecs[i]
        var columnName = sortSpecification.qualifiedColumnName;
        var directionCoefficient = sortSpecification.directionCoefficient;

        var aValue = a[columnName];
        var bValue = b[columnName];

        if (lessThan(aValue, bValue)) return -1 * directionCoefficient;
        else if (lessThan(bValue, aValue)) return 1 * directionCoefficient;
      }
      return 0;
    };
  },

  buildSortKey: function(tuple, changeset) {
    var sortKey = {};
    _.each(this.sortSpecifications, function(sortSpec) {
      var column = sortSpec.column;
      var columnName = sortSpec.columnName;
      var qualifiedColumnName = sortSpec.qualifiedColumnName;

      if (changeset && changeset[columnName] && changeset[columnName].column === column) {
        sortKey[qualifiedColumnName] =  changeset[columnName].oldValue;
      } else {
        var field = tuple.field(column);
        sortKey[qualifiedColumnName] =  field.value();
      }
    });
    return sortKey;
  },

  tupleInsertedRemotely: function(tuple, newKey, oldKey) {
    if (!newKey) newKey = oldKey = this.buildSortKey(tuple);
    var index = this.storedTuples.insert(newKey, tuple)
    this.onInsertNode.publish(tuple, index, newKey, oldKey);
  },

  tupleUpdatedRemotely: function(tuple, changeset, newKey, oldKey) {
    if (!newKey) {
      newKey = this.buildSortKey(tuple);
      oldKey = this.buildSortKey(tuple, changeset);
    }

    var oldIndex = this.storedTuples.remove(oldKey)
    var newIndex = this.storedTuples.insert(newKey, tuple);
    this.onUpdateNode.publish(tuple, changeset, newIndex, oldIndex, newKey, oldKey);
  },

  // default implementations. overridden by many subclasses

  tupleRemovedRemotely: function(tuple, newKey, oldKey) {
    if (!newKey) newKey = oldKey = this.buildSortKey(tuple);

    var index = this.storedTuples.remove(oldKey);
    this.onRemoveNode.publish(tuple, index, newKey, oldKey);
  },

  recordMadeDirty: function(record, newKey, oldKey) {
    if (!newKey) newKey = oldKey = this.buildSortKey(record);
    this.onDirtyNode.publish(record, this.indexByKey(oldKey), newKey, oldKey);
  },

  recordMadeClean: function(record, newKey, oldKey) {
    if (!newKey) newKey = oldKey = this.buildSortKey(record);
    this.onCleanNode.publish(record, this.indexByKey(oldKey), newKey, oldKey);
  },

  recordMadeInvalid: function(record, newKey, oldKey) {
    if (!newKey) newKey = oldKey = this.buildSortKey(record);
    this.onInvalidNode.publish(record, this.indexByKey(oldKey), newKey, oldKey)
  },

  recordMadeValid: function(record, newKey, oldKey) {
    if (!newKey) newKey = oldKey = this.buildSortKey(record);
    this.onValidNode.publish(record, this.indexByKey(oldKey), newKey, oldKey);
  },

  tupleUpdatedLocally: function(tuple, updateData) {
    this.onLocalUpdateNode.publish(tuple, updateData);
  },

  extractSortSpecsFromArguments: function(args) {
    return _.map(args, function(orderByColumn) {
      if (orderByColumn instanceof Monarch.Model.SortSpecification) {
        return orderByColumn;
      } else if (orderByColumn instanceof Monarch.Model.Column) {
        return orderByColumn.asc();
      } else if (typeof orderByColumn == "string") {
        var parts = orderByColumn.split(/ +/);
        var columnName = parts[0];
        var direction = parts[1] || 'asc';
        if (direction == 'desc') {
          return this.column(columnName).desc();
        } else {
          return this.column(columnName).asc();
        }
      } else {
        throw new Error("You can only order by Columns, sortSpecifications, or 'columnName direction' strings");
      }
    }, this);
  },

  subscribeToOperandsIfNeeded: function() {
    if (this.numOperands > 0 && !this.hasSubscribers()) {
      this.subscribeToOperands();
      this.memoizeTuples();
    }
  },

  subscribeToOperands: function() {
    switch(this.numOperands) {
      case 1:
        this.subscribeToOperand(this.operand);
        break;
      case 2:
        this.subscribeToOperand(this.leftOperand, 'left');
        this.subscribeToOperand(this.rightOperand, 'right');
        break;
      default:
        throw new Error("Don't understand that number of operands");
    }
  },

  // meta-programming to subscribe to all event types for a given operand. should expand to code like:
  // this.operandsSubscriptionBundle.add(operand.onInsert(this.hitch('onLeftOperandInsert')));
  subscribeToOperand: function(operand, leftOrRight) {
    var events = ['insert', 'update', 'remove', 'dirty', 'clean', 'invalid', 'valid'];

    _.each(events, function(event) {
      var onEvent = 'on' + _.capitalize(event);
      var onOperandEvent = _.camelize('on_' + (leftOrRight || "") + "_operand_" + event, true);
      this.operandsSubscriptionBundle.add(operand[onEvent](this.hitch(onOperandEvent)));
    }, this);
  },

  onOperandRemove: function(tuple, index, newKey, oldKey) {
    if (this.findByKey(oldKey)) this.tupleRemovedRemotely(tuple, newKey, oldKey);
  },

  onOperandDirty: function(tuple, index, newKey, oldKey) {
    if (this.findByKey(oldKey)) this.recordMadeDirty(tuple, newKey, oldKey);
  },

  onOperandClean: function(tuple, index, newKey, oldKey) {
    if (this.findByKey(oldKey)) this.recordMadeClean(tuple, newKey, oldKey);
  },

  onOperandInvalid: function(tuple, index, newKey, oldKey) {
    if (this.findByKey(oldKey)) this.recordMadeInvalid(tuple, newKey, oldKey);
  },

  onOperandValid: function(tuple, index, newKey, oldKey) {
    if (this.findByKey(oldKey)) this.recordMadeValid(tuple, newKey, oldKey);
  },

  unsubscribeFromOperandsWhenThisNoLongerHasSubscribers: function() {
    var unsubscribeCallback = _.bind(function() {
       if (!this.hasSubscribers()) this.unsubscribeFromOperands();
    }, this);

    this.onInsertNode.onUnsubscribe(unsubscribeCallback);
    this.onRemoveNode.onUnsubscribe(unsubscribeCallback);
    this.onUpdateNode.onUnsubscribe(unsubscribeCallback);
    this.onDirtyNode.onUnsubscribe(unsubscribeCallback);
    this.onCleanNode.onUnsubscribe(unsubscribeCallback);
  },

  unsubscribeFromOperands: function() {
    this.operandsSubscriptionBundle.destroy();
    this.storedTuples = null;
  },

  predicateFromHash: function(hash) {
    var predicates = [];
    _.each(hash, function(value, key) {
      var column = this.column(key);
      if (!column) { throw new Error("No column named " + key + " found."); }
      predicates.push(column.eq(value))
    }, this);

    if (_.isEmpty(predicates)) throw new Error("No key value pairs provided for predication");

    if (predicates.length == 1) {
      return predicates[0];
    } else {
      return new Monarch.Model.Predicates.And(predicates);
    }
  },

  findJoinColumns: function(left, right) {
    var foreignKey;
    if (foreignKey = right.column(_.camelize(_.singularize(left.globalName), true) + "Id")) {
      return [left.column("id"), foreignKey];
    } else if (foreignKey = left.column(_.camelize(_.singularize(right.globalName), true) + "Id")) {
      return [foreignKey, right.column("id")];
    } else {
      throw new Error("No foreign key found for #joinTo operation");
    }
  }

});

})(Monarch);

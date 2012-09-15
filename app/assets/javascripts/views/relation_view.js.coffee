class Views.RelationView extends View
  @content: (options) ->
    tag = options.tag ? 'ol'
    attributes = options.attributes ? {}
    this[tag](attributes)

  # this required method is assigned on creation
  # it takes a record and an index and returns an element
  buildItem: null

  # optional methods that can be assigned on creation
  updateIndices: null
  onInsert: null
  onUpdate: null
  onRemove: null

  subscriptions: null

  initialize: (options) ->
    { @buildItem, @updateIndex, @onInsert, @onUpdate, @onRemove } = options
    @subscriptions = []

  setRelation: (relation) ->
    @unsubscribe()
    @empty()

    return if !relation? or relation == @relation
    @relation = relation

    @relation.each (record, index) =>
      element = @elementForRecord(record, index)
      @append(element)
      @onInsert?(element, record, index)

    @subscribe relation, 'onInsert', (record, index) =>
      element = @elementForRecord(record, index)
      @insertAtIndex(element, index)
      @onInsert?(element, record, index)

    @subscribe relation, 'onUpdate', (record, changes, newIndex, oldIndex) =>
      element = @elementForRecord(record, newIndex)
      @insertAtIndex(element, newIndex)
      @onUpdate?(element, record, changes, newIndex, oldIndex);

    @subscribe relation, 'onRemove', (record, index) =>
      element = @elementForRecord(record, index);
      element.remove()
      delete @elementsById[record.id()]
      @onRemove?(element, record, index)

  insertAtIndex: (element, index) ->
    element.detach()

    insertBefore = this.find("> :eq(" + index + ")")
    if insertBefore.length > 0
      insertBefore.before(element)
    else
      @append(element)

    @updateIndices()

  elementForRecord: (record, index) ->
    @elementsById[record.id()] ?= @buildItem(record, index)

  updateIndices: ->
    if @updateIndex?
      @children().each (index) =>
        @updateIndex($(this), index)

  empty: ->
    element.remove() for id, element of @elementsById
    @elementsById = {}

  subscribe: (relation, method, callback) ->
    @subscriptions.push relation[method](callback)

  unsubscribe: ->
    subscription.destroy() for subscription in @subscriptions
    @subscriptions = []

  remove: (keepData) ->
    @unsubscribe() unless keepData
    super

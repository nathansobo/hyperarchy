class Views.RelationView extends View
  @content: (options) ->
    tag = options.tag ? 'ol'
    attributes = options.attributes ? {}
    this[tag](attributes)

  # this required method is assigned on creation
  # it takes a record and an index and returns an element
  buildItem: null

  # optional methods that can be assigned on creation
  updateIndex: null
  onInsert: null
  onUpdate: null
  onRemove: null

  subscriptions: null

  initialize: (options) ->
    { @buildItem, @updateIndex, @onInsert, @onUpdate, @onRemove } = options
    @subscriptions = []

  setRelation: (relation) ->
    return if relation == @relation
    @unsubscribe()
    @empty()

    return return unless relation
    @relation = relation

    @relation.each (record, index) =>
      element = @elementForRecord(record, index)
      @append(element)
      @onInsert?(element, record, index)

    @subscribe relation, 'onInsert', (record, index) =>
      element = @elementForRecord(record, index)
      @insertAtIndex(element, index)
      @onInsert?(element, record, index)
      @updateIndices()

    @subscribe relation, 'onUpdate', (record, changes, newIndex, oldIndex) =>
      if newIndex != oldIndex
        element = @elementForRecord(record, newIndex)
        @insertAtIndex(element, newIndex)
      @onUpdate?(element, record, changes, newIndex, oldIndex);
      @updateIndices()

    @subscribe relation, 'onRemove', (record, index) =>
      element = @elementForRecord(record, index);
      element.remove()
      delete @elementsById[record.id()]
      @onRemove?(element, record, index)
      @updateIndices()

  insertAtIndex: (element, index) ->
    element.detach()

    insertBefore = this.find("> :eq(" + index + ")")
    if insertBefore.length > 0
      insertBefore.before(element)
    else
      @append(element)

  elementForRecord: (record, index) ->
    @elementsById[record.id()] ?= @buildItem(record, index)

  updateIndices: ->
    if @updateIndex?
      view = this
      @children().each (index) ->
        view.updateIndex($(this), index)

  empty: ->
    element.remove() for id, element of @elementsById
    @elementsById = {}

  subscribe: (relation, method, callback) ->
    @subscriptions.push relation[method](callback)

  unsubscribe: ->
    subscription.destroy() for subscription in @subscriptions
    @subscriptions = []

  remove: (selector, keepData) ->
    @unsubscribe() unless keepData
    super

class Models.Answer extends Monarch.Record
  @tableName = 'Answer'
  @extended(this)

  @columns
    questionId: 'integer'
    creatorId: 'integer'
    body: 'string'
    position: 'integer'
    createdAt: 'datetime'

  @defaultOrderBy 'position asc'

  @belongsTo 'question'
  @belongsTo 'creator', className: 'User'
  @hasMany 'preferences'

  answer: ->
    this

  preferenceForCurrentUser: ->
    @preferences().find(userId: Models.User.getCurrent().id())

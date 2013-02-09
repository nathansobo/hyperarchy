class Models.Question extends Monarch.Record
  @tableName = 'Question'
  @extended(this)

  @columns
    creatorId: 'integer'
    body: 'string'
    archivedAt: 'datetime'
    rankingCount: 'integer'

  @defaultOrderBy 'id desc'

  @hasMany 'answers'
  @hasMany 'rankings'
  @hasMany 'comments', className: 'QuestionComment'

  @belongsTo 'creator', className: 'User'

  @syntheticColumn 'archived', ->
      @signal 'archivedAt', (archivedAt) -> archivedAt > 0

  newAnswers: ->
    if @rankingForCurrentUser()
      @answers().where('createdAt >': @rankingForCurrentUser().updatedAt())

  rankingForCurrentUser: ->
    @rankings().find(userId: Models.User.currentUserId)

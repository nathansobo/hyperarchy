class Models.Question extends Monarch.Record
  @tableName = 'Question'
  @extended(this)

  @columns
    creatorId: 'integer'
    body: 'string'
    state: 'string'
    rankingCount: 'integer'

  @defaultOrderBy 'id desc'

  @hasMany 'answers'
  @hasMany 'rankings'
  @hasMany 'comments', className: 'QuestionComment'

  @belongsTo 'creator', className: 'User'

  newAnswers: ->
    if @rankingForCurrentUser()
      @answers().where('createdAt >': @rankingForCurrentUser().updatedAt())

  rankingForCurrentUser: ->
    @rankings().find(userId: Models.User.currentUserId)

  oppositeState: ->
    if @state() == null || /open/i.test(@state())
      'Archived'
    else
      'Open'

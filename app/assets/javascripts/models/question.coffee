class Models.Question extends Monarch.Record
  @tableName = 'Question'
  @extended(this)

  @columns
    creatorId: 'integer'
    body: 'string'
    voteCount: 'integer'

  @defaultOrderBy 'id desc'

  @hasMany 'answers'
  @hasMany 'votes'
  @hasMany 'comments', className: 'QuestionComment'

  @belongsTo 'creator', className: 'User'

  newAnswers: ->
    if @voteForCurrentUser()
      @answers().where('createdAt >': @voteForCurrentUser().updatedAt())

  voteForCurrentUser: ->
    @votes().find(userId: Models.User.currentUserId)

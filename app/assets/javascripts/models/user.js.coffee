class Models.User extends Monarch.Record
  @tableName = 'User'
  @extended(this)

  @columns
    fullName: 'string'
    avatarUrl: 'string'

  @hasMany 'answers', foreignKey: 'creatorId'
  @hasMany 'rankings'
  @hasMany 'votes'

  @currentUserId: null # assigned by Rails

  @getCurrent: ->
    @find(@currentUserId)

  rankingsForQuestion: (question) ->
    @rankings().where(questionId: question.id())

  voteForQuestion: (question) ->
    @votes().find(questionId: question.id())

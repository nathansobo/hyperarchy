class Models.User extends Monarch.Record
  @tableName = 'User'
  @extended(this)

  @columns
    fullName: 'string'
    avatarUrl: 'string'

  @hasMany 'answers', foreignKey: 'creatorId'
  @hasMany 'preferences'
  @hasMany 'votes'

  @currentUserId: null # assigned by Rails

  @getCurrent: ->
    @find(@currentUserId)

  preferencesForQuestion: (question) ->
    @preferences().where(questionId: question.id())

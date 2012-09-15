class Models.User extends Monarch.Record
  @extended(this)

  @columns
    fullName: 'string'

  @hasMany 'answers', foreignKey: 'creatorId'
  @hasMany 'rankings'

  @currentUserId: null # assigned by Rails

  @getCurrent: ->
    @find(@currentUserId)

  rankingsForQuestion: (question) ->
    @rankings().where(questionId: question.id())

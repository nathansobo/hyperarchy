class Models.Answer extends Monarch.Record
  @extended(this)

  @columns
    questionId: 'integer'
    creatorId: 'integer'
    body: 'string'
    position: 'integer'

  @defaultOrderBy 'position asc'

  @belongsTo 'question'

  creator: ->
    Models.User.find(@creatorId())
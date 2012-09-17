class Models.Vote extends Monarch.Record
  @extended(this)

  @columns
    userId: 'integer'
    questionId: 'integer'
    createdAt: 'datetime'
    updatedAt: 'datetime'

  @belongsTo 'user'
  @belongsTo 'question'

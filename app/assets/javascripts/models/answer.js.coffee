class Models.Answer extends Monarch.Record
  @extended(this)

  @columns
    questionId: 'integer'
    creatorId: 'integer'
    body: 'string'
    position: 'integer'

  @belongsTo 'question'

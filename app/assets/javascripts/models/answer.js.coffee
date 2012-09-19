class Models.Answer extends Monarch.Record
  @tableName = 'Answer'
  @extended(this)

  @columns
    questionId: 'integer'
    creatorId: 'integer'
    body: 'string'
    position: 'integer'

  @defaultOrderBy 'position asc'

  @belongsTo 'question'
  @belongsTo 'creator', className: 'User'

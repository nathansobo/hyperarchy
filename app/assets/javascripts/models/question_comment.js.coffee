class Models.QuestionComment extends Monarch.Record
  @extended(this)

  @columns
    questionId: 'integer'
    creatorId: 'integer'
    body: 'string'
    createdAt: 'datetime'

  @defaultOrderBy 'createdAt asc'

  @belongsTo 'question'
  @belongsTo 'creator', className: 'User'

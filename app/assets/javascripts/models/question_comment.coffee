class Models.QuestionComment extends Monarch.Record
  @tableName = 'QuestionComment'
  @extended(this)

  @columns
    questionId: 'integer'
    creatorId: 'integer'
    body: 'string'
    createdAt: 'datetime'

  @defaultOrderBy 'createdAt asc'

  @belongsTo 'question'
  @belongsTo 'creator', className: 'User'

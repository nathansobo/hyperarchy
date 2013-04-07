class Models.QuestionPermission extends Monarch.Record
  @tableName = 'QuestionPermission'
  @extended(this)

  @columns
    secret: 'string'
    questionId: 'integer'
    userId: 'integer'

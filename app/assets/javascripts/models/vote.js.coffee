class Models.Vote extends Monarch.Record
  @tableName = 'Vote'
  @extended(this)

  @columns
    userId: 'integer'
    questionId: 'integer'
    createdAt: 'datetime'
    updatedAt: 'datetime'

  @defaultOrderBy 'updatedAt desc'

  @belongsTo 'user'
  @belongsTo 'question'
  @hasMany 'rankings'
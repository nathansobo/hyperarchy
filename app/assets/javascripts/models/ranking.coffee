class Models.Ranking extends Monarch.Record
  @tableName = 'Ranking'
  @extended(this)

  @columns
    userId: 'integer'
    questionId: 'integer'
    createdAt: 'datetime'
    updatedAt: 'datetime'

  @defaultOrderBy 'updatedAt desc'

  @belongsTo 'user'
  @belongsTo 'question'
  @hasMany 'preferences'
  @hasMany 'answers', through: 'preferences'

  getUrl: ->
    "#{@question().getUrl()}/rankings/#{@userId()}"

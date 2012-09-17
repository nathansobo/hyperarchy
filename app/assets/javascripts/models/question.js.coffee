class Models.Question extends Monarch.Record
  @extended(this)

  @columns
    creatorId: 'integer'
    body: 'string'
    voteCount: 'integer'

  @defaultOrderBy 'id desc'

  @hasMany 'answers'
  @hasMany 'votes'
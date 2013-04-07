class Models.Question extends Monarch.Record
  @tableName = 'Question'
  @extended(this)

  @columns
    creatorId: 'integer'
    body: 'string'
    groupId: 'integer'
    visibility: 'string'
    archivedAt: 'datetime'
    rankingCount: 'integer'
    secret: 'string'

  @defaultOrderBy 'id desc'

  @hasMany 'answers'
  @hasMany 'rankings'
  @hasMany 'comments', className: 'QuestionComment'

  @belongsTo 'creator', className: 'User'

  @syntheticColumn 'archived', ->
    @signal 'archivedAt', (archivedAt) -> archivedAt?

  @fetchData: (questionId) ->
    {User, Answer, Preference, Ranking, QuestionComment} = Models
    questionRelations = [Answer, Preference, Ranking, QuestionComment].map (r) -> r.where({questionId})
    Monarch.Remote.Server.fetch([User, Models.Question.where(id: questionId), questionRelations...])

  getUrl: ->
    "/questions/#{@toParam()}"

  toParam: ->
    @secret() ? @id()

  newAnswers: ->
    if @rankingForCurrentUser()
      @answers().where('createdAt >': @rankingForCurrentUser().updatedAt())

  rankingForCurrentUser: ->
    @rankings().find(userId: Models.User.currentUserId)

  toggleArchived: ->
    if @archived()
      @update(archivedAt: null)
    else
      @update(archivedAt: new Date())

class Models.Ranking extends Monarch.Record
  @tableName = 'Ranking'
  @extended(this)

  @columns
    userId: 'integer'
    voteId: 'integer'
    questionId: 'integer'
    answerId: 'integer'
    position: 'float'

  @defaultOrderBy 'position desc'

  @belongsTo 'user'
  @belongsTo 'question'
  @belongsTo 'answer'
  @belongsTo 'vote'

  @createOrUpdate: ({answer, position}) ->
    jQuery.ajax(
      type: 'post'
      url: '/rankings'
      dataType: 'data+records'
      data:
        answer_id: answer.id()
        position: position
    )

  @destroyByAnswerId: (answerId) ->
    jQuery.ajax(
      type: 'delete'
      url: '/rankings'
      data: { answer_id: answerId }
    )

class Models.Preference extends Monarch.Record
  @tableName = 'Preference'
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
      url: '/preferences'
      dataType: 'data+records'
      data:
        answer_id: answer.id()
        position: position
    )

  @destroyByAnswerId: (answerId) ->
    jQuery.ajax(
      type: 'delete'
      url: '/preferences'
      data: { answer_id: answerId }
    )

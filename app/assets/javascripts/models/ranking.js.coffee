class Models.Ranking extends Monarch.Record
  @extended(this)

  @columns
    userId: 'integer'
    questionId: 'integer'
    answerId: 'integer'
    position: 'float'

  @belongsTo 'user'
  @belongsTo 'question'
  @belongsTo 'answer'

  @createOrUpdate: ({answer, position}) ->
    jQuery.ajax(
      type: 'post'
      url: '/rankings'
      dataType: 'data+records'
      data:
        answer_id: answer.id()
        position: position
    ).pipe (data) ->
      Ranking.find(data.ranking_id)

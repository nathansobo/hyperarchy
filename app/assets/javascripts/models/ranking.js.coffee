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

  @createOrUpdate: ({user, answer, position}) ->
    jQuery.ajax(
      type: 'post'
      url: '/rankings'
      dataType: 'data+records'
      data:
        user_id: user.id()
        answer_id: answer.id()
        position: position
    ).pipe (data) ->
      Ranking.find(data.ranking_id)

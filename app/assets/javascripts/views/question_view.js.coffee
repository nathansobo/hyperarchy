class Views.QuestionView extends View
  @content: ->
    @div class: 'row question', =>
      @div class: 'span4', =>
        @div class: 'body lead', outlet: 'body'
        @div class: 'new-answer-form', =>
          @textarea rows: 2, outlet: 'newAnswerTextarea'
          @button "Suggest Answer", class: 'btn pull-right', click: 'createAnswer'
      @div class: 'span4', =>
        @h5 "Collective Ranking"
        @subview 'collectiveRanking', new Views.RelationView(
          attributes: { class: 'collective ranking' }
          buildItem: (answer, index) ->
            $$ -> @li answer.body(), class: 'answer'
        )

  initialize: (@question) ->
    @body.text(question.body())
    @collectiveRanking.setRelation(question.answers())

  createAnswer: ->
    body = @newAnswerTextarea.val()
    console.log body
    unless body.match(/\S/)
      console.log 'NO'
      return
    @question.answers().create({ body })


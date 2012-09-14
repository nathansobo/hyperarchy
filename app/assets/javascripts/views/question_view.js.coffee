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
            $$ -> @li answer.body(), class: 'answer', 'data-answer-id': answer.id()
        )
      @div class: 'span4', =>
        @h5 "Your Ranking"
        @subview 'personalRanking', new Views.RelationView(
          attributes: { class: 'personal ranking' }
          buildItem: (answer, index) ->
            $$ -> @li answer.body(), class: 'answer', 'data-answer-id': answer.id()
        )

  initialize: (@question) ->
    @itemsByAnswerId = {}
    @body.text(question.body())
    @collectiveRanking.setRelation(question.answers())

    @collectiveRanking.find('li').draggable(
      helper: ->
        $(this).clone().width($(this).width())

      appendTo: 'body'
      connectToSortable: '.personal.ranking'
    )

    removeItem = null

    @personalRanking.sortable(
      receive: -> removeItem = 0
      over: -> removeItem = 0
      out: -> removeItem = 1
      beforeStop: (event, ui) -> ui.item.remove() if removeItem
      stop: (event, ui) => @updateAnswerRanking(ui.item)
    )

  updateAnswerRanking: (item) ->
    answerId = item.data('answer-id')
    oldItem = @itemsByAnswerId[answerId]
    oldItem?.remove() unless oldItem?[0] is item[0]
    @itemsByAnswerId[answerId] = item

    lowerPosition = item.next()?.data('position') ? 0
    if item.prev().length
      upperPosition = item.prev().data('position')
      position = (upperPosition + lowerPosition) / 2
    else
      position = lowerPosition + 1

    item.data('position', position)
    Models.Ranking.createOrUpdate(
      answer: Models.Answer.find(answerId)
      position: position
    )

  createAnswer: ->
    body = @newAnswerTextarea.val()
    console.log body
    unless body.match(/\S/)
      console.log 'NO'
      return
    @question.answers().create({ body })


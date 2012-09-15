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
        )
      @div class: 'span4', =>
        @h5 "Your Ranking"
        @subview 'personalRanking', new Views.RelationView(
          attributes: { class: 'personal ranking' }
        )

  initialize: (@question) ->
    @rankedItemsByAnswerId = {}
    @body.text(question.body())

    @collectiveRanking.buildItem = (answer) => @buildAnswerItem(answer, draggable: true)
    @collectiveRanking.setRelation(question.answers())

    @personalRanking.buildItem = (ranking) =>
      @buildAnswerItem(ranking.answer(), position: ranking.position())
    @personalRanking.onInsert = (item, ranking) =>
      @rankedItemsByAnswerId[ranking.answerId()]?.remove()
      @rankedItemsByAnswerId[ranking.answerId()] = item
    @personalRanking.setRelation(Models.User.getCurrent().rankingsForQuestion(question))

    removeItem = null
    @personalRanking.sortable(
      receive: -> removeItem = 0
      over: -> removeItem = 0
      out: -> removeItem = 1
      beforeStop: (event, ui) -> ui.item.detach() if removeItem
      stop: (event, ui) => @updateAnswerRanking(ui.item)
    )

    @newAnswerTextarea.keydown (e) =>
      if e.keyCode == 13 # enter
        @createAnswer()
        e.preventDefault()

  buildAnswerItem: (answer, options={}) ->
    item = $$ -> @li answer.body(), class: 'answer', 'data-answer-id': answer.id()

    if options.draggable
      item.draggable(
        helper: -> $(this).clone().width($(this).width())
        appendTo: 'body'
        connectToSortable: '.personal.ranking'
      )

    if position = options.position
      item.data('position', position)

    item

  updateAnswerRanking: (item) ->
    answerId = item.data('answer-id')
    answer = Models.Answer.find(answerId)

    unless item.parent().length
      Models.Ranking.destroyByAnswerId(answerId)
        .success => @highlightAnswerInCollectiveRanking(answer, true)
      delete @rankedItemsByAnswerId[answerId]
      item.remove()
      return

    existingItem = @rankedItemsByAnswerId[answerId]
    if existingItem and existingItem[0] != item[0]
      item.replaceWith(existingItem.detach())
      item = existingItem
    @rankedItemsByAnswerId[answerId] = item

    lowerPosition = item.next()?.data('position') ? 0
    if item.prev().length
      upperPosition = item.prev().data('position')
      position = (upperPosition + lowerPosition) / 2
    else
      position = lowerPosition + 1

    item.data('position', position)
    item.text(item.text().replace('undefined', position))

    Models.Ranking.createOrUpdate(
      answer: answer
      position: position
    )
      .success =>
        @highlightAnswerInCollectiveRanking(answer, true)

  createAnswer: ->
    body = @newAnswerTextarea.val()
    return unless body.match(/\S/)
    @newAnswerTextarea.val('')
    @question.answers().create({ body })
      .onSuccess (answer) => @highlightAnswerInCollectiveRanking(answer)

  highlightAnswerInCollectiveRanking: (answer, delay) ->
    if delay
      subscription = @question.onUpdate =>
        subscription.destroy()
        fn = => @highlightAnswerInCollectiveRanking(answer)
        _.delay(fn, 30)
      return

    item = @collectiveRanking.find(".answer[data-answer-id=#{answer.id()}]")

    if item.position().top < 0 or item.position().top > @collectiveRanking.height()
      @collectiveRanking.scrollTo(item, over: -.5)
    item.effect('highlight')

  remove: (selector, keepData) ->
    super
    unless keepData
      @collectiveRanking.remove()
      @personalRanking.remove()

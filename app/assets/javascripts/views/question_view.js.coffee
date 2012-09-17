class Views.QuestionView extends View
  @content: ->
    @div class: 'question', =>
      @div class: 'row', =>
        @div class: 'span12', =>
          @div class: 'body lead', outlet: 'body'
          @div class: 'new-answer-form hide', =>
            @textarea rows: 2, outlet: 'newAnswerTextarea'
            @button "Suggest Answer", class: 'btn pull-right', click: 'createAnswer'

      @div class: 'row', =>
        @div class: 'span4', =>
          @h5 "Collective Ranking"
          @subview 'collectiveVote', new Views.RelationView(
            attributes: { class: 'collective vote' }
          )
        @div class: 'span4', =>
          @h5 "Your Ranking"
          @subview 'personalVote', new Views.RelationView(
            attributes: { class: 'personal vote' }
          )
        @div class: 'span4', =>
          @h5 "Individual Rankings"
          @subview 'allVotes', new Views.RelationView(
            attributes: { class: 'votes' }
            buildItem: (vote) -> new Views.VoteView(vote)
          )

  initialize: (@question) ->
    @rankedItemsByAnswerId = {}
    @body.text(question.body())

    @collectiveVote.buildItem = (answer) => @buildAnswerItem(answer, draggable: true)
    @collectiveVote.setRelation(question.answers())

    @personalVote.buildItem = (ranking) =>
      @buildAnswerItem(ranking.answer(), position: ranking.position())
    @personalVote.onInsert = (item, ranking) =>
      @rankedItemsByAnswerId[ranking.answerId()]?.remove()
      @rankedItemsByAnswerId[ranking.answerId()] = item
    @personalVote.setRelation(Models.User.getCurrent().rankingsForQuestion(question))

    removeItem = null
    @personalVote.sortable(
      receive: -> removeItem = 0
      over: -> removeItem = 0
      out: -> removeItem = 1
      beforeStop: (event, ui) -> ui.item.detach() if removeItem
      stop: (event, ui) => @updateAnswerRanking(ui.item)
    )

    @allVotes.setRelation(@question.votes())

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
        connectToSortable: '.personal.vote'
      )

    if position = options.position
      item.data('position', position)

    item

  updateAnswerRanking: (item) ->
    answerId = item.data('answer-id')
    answer = Models.Answer.find(answerId)

    unless item.parent().length
      Models.Ranking.destroyByAnswerId(answerId)
        .done => @highlightAnswerInCollectiveRanking(answer, true)
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
      .done =>
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

    item = @collectiveVote.find(".answer[data-answer-id=#{answer.id()}]")

    if item.position().top < 0 or item.position().top > @collectiveVote.height()
      @collectiveVote.scrollTo(item, over: -.5)
    item.effect('highlight')

  remove: (selector, keepData) ->
    super
    unless keepData
      @collectiveVote.remove()
      @personalVote.remove()
      @allVotes.remove()

class Views.QuestionView extends View
  @content: ->
    @div class: 'question', =>
      @div class: 'row header', =>
        @div class: 'span8', =>
          @div class: 'body lead', outlet: 'body'
        @div class: 'span4', =>
          @button class: 'delete btn btn-link pull-right', outlet: 'deleteButton', =>
            @i class: 'icon-trash'
            @span "Delete"

          @button class: 'edit-body btn btn-link pull-right', outlet: 'editButton', =>
            @i class: 'icon-edit'
            @span "Edit"

      @div class: 'row', =>
        @div class: 'span4', =>
          @button "+ Add Answer", class: 'btn btn-small btn-primary pull-right add-answer', click: 'addAnswer'
          @h5 "Collective Ranking"
          @subview 'collectiveVote', new Views.RelationView(
            attributes: { class: 'collective vote column' }
          )
        @div class: 'span4', =>
          @h5 =>
            @a "Your Ranking", class: 'no-href disabled', click: 'showPersonalVote', outlet: 'showPersonalVoteLink'
            @span "|", class: 'separator'
            @a "All Rankings", class: 'no-href', click: 'showAllVotes', outlet: 'showAllVotesLink'

          @subview 'personalVote', new Views.RelationView(
            attributes: { class: 'personal vote column' }
          )

          @subview 'allVotes', new Views.RelationView(
            attributes: { class: 'all-votes column hide' }
            buildItem: (vote) -> new Views.VoteView(vote)
          )

        @div class: 'span4', =>
          @h5 'Discussion'
          @div class: 'discussion column', =>
            @div class: 'text-entry', =>
              @textarea rows: 2
              @button "Submit Comment", class: 'btn pull-right'

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

    unless @question.creator() == Models.User.getCurrent()
      @editButton.hide()
      @deleteButton.hide()

  buildAnswerItem: (answer, options={}) ->
    item = $$ -> @li answer.body(), class: 'answer', 'data-answer-id': answer.id()

    if options.draggable
      item.draggable(
        helper: -> $(this).clone().width($(this).width())
        appendTo: 'body'
        connectToSortable: '.personal.vote'
        delay: 1
      )
      item.mousedown => @showPersonalVote()

    if position = options.position
      item.data('position', position)

    item

  showPersonalVote: ->
    @enableLink(@showAllVotesLink)
    @disableLink(@showPersonalVoteLink)
    @allVotes.hide()
    @personalVote.show()

  showAllVotes: ->
    @enableLink(@showPersonalVoteLink)
    @disableLink(@showAllVotesLink)
    @personalVote.hide()
    @allVotes.show()

  enableLink: (link) ->
    link.removeClass('disabled')

  disableLink: (link) ->
    link.addClass('disabled')

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

  addAnswer: ->
    new Views.NewAnswerForm(@question)
      .appendTo('body')
      .modal('show')

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

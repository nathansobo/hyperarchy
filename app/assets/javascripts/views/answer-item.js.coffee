class Views.AnswerItem extends View
  @content: (answer, index, options={}) ->
    @li class: 'answer', 'data-answer-id': answer.id(), =>
      @div index + 1, class: 'index'
      @i class: 'small icon-remove pull-right', click: 'deleteAnswer'
      @i class: 'small icon-edit pull-right', click: 'editAnswer'
      @div class: 'body neuter-markdown', outlet: 'body', =>
        @raw markdown.toHTML(answer.body())

  initialize: (@answer, options={}) ->
    if @answer.creator() == Models.User.getCurrent()
      @addClass 'editable'

    if options.draggable
      @draggable(
        appendTo: 'body'
        connectToSortable: '.personal.vote'
        delay: 1
        helper: => @buildDragHelper()
      )
      @updateRankIndicator()

      @rankIndicator.hover(
        => @highlightAnswerInPersonalVote(),
        => @unhighlightAnswerInPersonalVote()
      )

    if position = options.position
      @data('position', position)

    @answer.getField('body').onChange (body) => @body.html(markdown.toHTML(body))

  updateRankIndicator: (ranking) ->
    if ranking = @answer.rankingForCurrentUser()
      otherRankings = Models.Ranking.where(questionId: ranking.questionId(), userId: ranking.userId())
      rank = otherRankings.indexOf(ranking) + 1
      @rankIndicator.text(rank)
      @rankIndicator.addClass('ranked')
    else
      @rankIndicator.text('')
      @rankIndicator.removeClass('ranked')

  personalVoteAnswerItem: ->
    @parents('.question').find(".personal.vote .answer[data-answer-id=#{@answer.id()}]")

  highlightAnswerInPersonalVote: ->
    @personalVoteAnswerItem().addClass('highlighted')

  unhighlightAnswerInPersonalVote: ->
    @personalVoteAnswerItem().removeClass('highlighted')

  buildDragHelper: ->
    new Views.AnswerItem(@answer).width(@width())

  editAnswer: ->
    new Views.ModalForm(
      text: @answer.body()
      headingText: "Edit your answer:"
      buttonText: "Save Changes"
      onSubmit: (body) => @answer.update({body})
    )

  deleteAnswer: ->
    if confirm("Are you sure you want to delete this answer?")
      @answer.destroy()
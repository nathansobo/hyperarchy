class Views.AnswerItem extends View
  @content: (answer, index, options={}) ->
    @li class: 'answer', 'data-answer-id': answer.id(), =>
      @div index + 1, class: 'index', outlet: 'index' if index?
      @i class: 'small icon-remove pull-right', click: 'deleteAnswer'
      @i class: 'small icon-edit pull-right', click: 'editAnswer'
      @div class: 'body neuter-markdown', outlet: 'body', =>
        @raw markdown.toHTML(answer.body())

  initialize: (@answer, index, options={}) ->
    if @answer.creator() == Models.User.getCurrent()
      @addClass 'editable'

    if options.draggable
      @draggable(
        appendTo: 'body'
        connectToSortable: '.personal.answer-list'
        delay: 1
        helper: => @buildDragHelper()
      )
      @updateRankIndicator()

    if position = options.position
      @data('position', position)

    @answer.getField('body').onChange (body) => @body.html(markdown.toHTML(body))

  updateRankIndicator: (ranking) ->
    if ranking = @answer.rankingForCurrentUser()
      @addClass('ranked')
    else
      @removeClass('ranked')

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
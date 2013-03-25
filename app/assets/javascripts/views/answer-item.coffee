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
        appendTo: '#question-page'
        connectToSortable: '.personal.answer-list'
        delay: 1
        helper: => @buildDragHelper()
        start: (e) => false if @answer.question().archived()
      )
      @updateRankIndicator()

    if position = options.position
      @data('position', position)

    @answer.getField('body').onChange (body) => @body.html(markdown.toHTML(body))

    @on 'mousedown', => false if @answer.question().archived()

  updateRankIndicator: ->
    if @answer.preferenceForCurrentUser()
      @addClass('ranked')
    else
      @removeClass('ranked')

  personalRankingAnswerItem: ->
    @parents('.question').find(".personal.ranking .answer[data-answer-id=#{@answer.id()}]")

  highlightAnswerInPersonalRanking: ->
    @personalRankingAnswerItem().addClass('highlighted')

  unhighlightAnswerInPersonalRanking: ->
    @personalRankingAnswerItem().removeClass('highlighted')

  buildDragHelper: ->
    new Views.AnswerItem(@answer).width(@width()).height(@height())

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

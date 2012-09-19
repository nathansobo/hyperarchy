class Views.AnswerItem extends View
  @content: (answer) ->
    @li class: 'answer', 'data-answer-id': answer.id(), =>
      @i class: 'small icon-remove pull-right', click: 'deleteAnswer'
      @i class: 'small icon-edit pull-right', click: 'editAnswer'

      @span answer.body(), outlet: 'body'

  initialize: (@answer, options={}) ->
    if options.draggable
      @draggable(
        appendTo: 'body'
        connectToSortable: '.personal.vote'
        delay: 1
        helper: ->
          helper = $(this).clone().width($(this).width())
          helper.find('.dropdown').remove()
          helper
      )

    if position = options.position
      @data('position', position)

    @answer.getField('body').onChange (body) => @body.text(body)


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
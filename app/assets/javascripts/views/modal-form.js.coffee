class Views.ModalForm extends View
  @content: ({headingText, buttonText}) ->
    @div class: 'modal-form modal hide fade', role: 'dialog', =>
      @div class: 'modal-header', =>
        @button class: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true', =>
          @raw '&times;'
        @span headingText, class: 'lead'
      @div class: 'modal-body', =>
        @textarea class: 'lead', rows: 3, outlet: 'textarea'
        @div class: 'chars-remaining pull-right', outlet: 'charsRemainingIndicator'
      @div class: 'modal-footer', =>
        @button buttonText, class: 'btn btn-primary', click: 'submit'

  initialize: ({text, @onSubmit}) ->
    @on 'shown', => @textarea.focus()
    @on 'hidden', => @remove()

    @textarea.val(text or '')

    @textarea.keydown (e) =>
      if e.keyCode == 13 and !e.ctrlKey # enter (ctrl-enter makes newline)
        e.preventDefault()
        @submit()

    @appendTo('body')
    @modal('show')

    @textarea.on 'input', => @updateCharsRemainingIndicator()
    @updateCharsRemainingIndicator()

  charsRemaining: ->
    140 - @textarea.val().length

  updateCharsRemainingIndicator: ->
    count = @charsRemaining()
    @charsRemainingIndicator.text(count)

    @charsRemainingIndicator.removeClass('invalid warning')
    if count < 0
      @charsRemainingIndicator.addClass('invalid')
    else if count < 10
      @charsRemainingIndicator.addClass('warning')


  submit: ->
    return if @charsRemaining() < 0
    @onSubmit(@textarea.val())
    @modal('hide')

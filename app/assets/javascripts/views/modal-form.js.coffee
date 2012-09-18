class Views.ModalForm extends View
  @content: ({headingText, buttonText}) ->
    @div class: 'modal-form modal hide fade', role: 'dialog', =>
      @div class: 'modal-header', =>
        @button class: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true', =>
          @raw '&times;'
        @span headingText, class: 'lead'
      @div class: 'modal-body', =>
        @textarea class: 'lead', rows: 3, outlet: 'textarea'
      @div class: 'modal-footer', =>
        @button buttonText, class: 'btn btn-primary', click: 'submit'

  initialize: ({text, @onSubmit}) ->
    @on 'shown', => @textarea.focus()
    @on 'hidden', => @remove()

    @textarea.val(text or '')

    @textarea.keydown (e) =>
      if e.keyCode == 13 # enter
        e.preventDefault()
        @submit()

    @appendTo('body')
    @modal('show')

  submit: ->
    @onSubmit(@textarea.val())
    @modal('hide')

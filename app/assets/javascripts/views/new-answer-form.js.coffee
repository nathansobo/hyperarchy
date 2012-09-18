class Views.NewAnswerForm extends View
  @content: (question) ->
    @div id: 'new-answer-form', class: 'modal hide fade', role: 'dialog', =>
      @div class: 'modal-header', =>
        @button class: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true', =>
          @raw '&times;'
        @span question.body(), class: 'lead'
      @div class: 'modal-body', =>
        @textarea class: 'lead', rows: 3, outlet: 'textarea'
      @div class: 'modal-footer', =>
        @button "Add Answer", class: 'btn btn-primary', click: 'createAnswer'

  question: null

  initialize: (@question) ->
    @on 'shown', => @textarea.focus()
    @on 'hidden', => @remove()

    @textarea.keydown (e) =>
      if e.keyCode == 13 # enter
        e.preventDefault()
        @createAnswer()

  createAnswer: ->
    @question.answers().create(body: @textarea.val())
      .success (question) => @modal('hide')


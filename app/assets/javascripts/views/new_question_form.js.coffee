class Views.NewQuestionForm extends View
  @content: ->
    @div id: 'new-question-form', class: 'modal hide fade', role: 'dialog', =>
      @div class: 'modal-header', =>
        @button class: 'close', 'data-dismiss': 'modal', 'aria-hidden': 'true', =>
          @raw '&times;'
        @h3 'Ask an open-ended question:'
      @div class: 'modal-body', =>
        @textarea class: 'lead', rows: 3, outlet: 'textarea'
      @div class: 'modal-footer', =>
        @button "Ask Question", class: 'btn btn-primary', click: 'createQuestion'

  initialize: ->
    @on 'shown', =>
      @textarea.focus()

  createQuestion: ->
    Models.Question.create(body: @textarea.val())
      .success (question) =>
        console.log question
        @modal('hide')


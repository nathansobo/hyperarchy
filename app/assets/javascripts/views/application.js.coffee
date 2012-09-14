class Views.Application extends View
  @content: ->
    @div id: 'application', class: 'container', =>
      @div class: 'navbar navbar-fixed-top navbar-inverse', =>
        @div class: 'navbar-inner', =>
          @div class: 'container', =>
            @a "Hyperarchy", class: 'brand', href: '/'
            @ul class: 'nav pull-right', =>
              @li =>
                @button "New Question", class: 'btn btn-primary', click: 'showNewQuestionForm'
      @div id: 'questions', outlet: 'questions'


  initialize: ->
    @newQuestionForm = new Views.NewQuestionForm().appendTo($('body'))
    Monarch.Remote.Server.fetch([Models.Question, Models.Answer])
      .onSuccess =>
        Models.Question.each (question) =>
          @questions.append(new Views.QuestionView(question))

  showNewQuestionForm: ->
    @newQuestionForm.modal('show')


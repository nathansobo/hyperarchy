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
      @subview 'questionsList', new Views.RelationView(
        tag: 'div'
        attributes: { id: 'questions' }
        buildItem: (question) ->
          new Views.QuestionView(question)
      )

  initialize: ->
    @newQuestionForm = new Views.NewQuestionForm().appendTo($('body'))
    Monarch.Remote.Server.fetch([Models.User, Models.Question, Models.Answer, Models.Ranking, Models.Vote])
      .onSuccess => @questionsList.setRelation(Models.Question.table)

  showNewQuestionForm: ->
    @newQuestionForm.modal('show')


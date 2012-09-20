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
    Monarch.Remote.Server.fetch([Models.User, Models.Question, Models.Answer, Models.Ranking, Models.Vote, Models.QuestionComment])
      .onSuccess =>
        @questionsList.setRelation(Models.Question.table)
        @buildAndStartRouter()

  buildAndStartRouter: ->
    view = this
    Davis ->
      @configure ->
        @generateRequestOnPageLoad = true
      @get '/:questionId', ({params}) ->
        view.showQuestion(params.questionId)

  showQuestion: (id) ->
    questionView = @questionsList.find(".question[data-question-id=#{id}]")
    $.scrollTo(questionView, offset: -60) if questionView.length

  showNewQuestionForm: ->
    new Views.ModalForm(
      headingText: "Ask an open-ended question:"
      buttonText: "Ask Question"
      onSubmit: (body) =>
        Models.Question.create({body})
    )

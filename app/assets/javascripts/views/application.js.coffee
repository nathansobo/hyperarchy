class Views.Application extends View
  @content: ->
    @div id: 'application', =>
      @div class: 'navbar navbar-fixed-top navbar-inverse', =>
        @div class: 'navbar-inner', =>
          @div class: 'container', =>
            @a "Hyperarchy", class: 'brand', href: '/'
            @ul class: 'nav pull-right', =>
              @li =>
                @button "New Question", class: 'btn btn-primary', click: 'showNewQuestionForm'

      @div class: 'container', outlet: 'pages', =>
        @subview 'questionsList', new Views.RelationView(
          tag: 'div'
          attributes: { id: 'questions', class: 'container' }
          buildItem: (question) ->
            $$ -> @div question.body(), class: 'question', 'data-question-id': question.id()
        )

        @subview 'questionView', new Views.QuestionView

  initialize: ->
    Monarch.Remote.Server.fetch([Models.User, Models.Question, Models.Answer, Models.Ranking, Models.Vote, Models.QuestionComment])
      .onSuccess =>
        @questionsList.setRelation(Models.Question.table)
        @buildAndStartRouter()

    @hidePages()

    @on 'click', '#questions .question', (e) =>
      questionId = $(e.target).data('question-id')
      Davis.location.assign "/#{questionId}"

  buildAndStartRouter: ->
    view = this
    Davis ->
      @configure ->
        @generateRequestOnPageLoad = true

      @get '/:questionId', ({params}) ->
        view.showQuestion(params.questionId)

      @get '/', ->
        view.showQuestionsList()

  showQuestionsList: ->
    @showPage('questionsList')

  showQuestion: (id) ->
    @questionView.setQuestion(Models.Question.find(parseInt(id)))
    @showPage('questionView')

  hidePages: ->
    @pages.children().hide()

  showPage: (outletName) ->
    @hidePages()
    this[outletName].show()

  showNewQuestionForm: ->
    new Views.ModalForm(
      headingText: "Ask an open-ended question:"
      buttonText: "Ask Question"
      onSubmit: (body) =>
        Models.Question.create({body})
    )

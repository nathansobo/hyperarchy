class Views.Application extends View
  @content: ->
    @div id: 'application', =>
      @div class: 'navbar navbar-fixed-top navbar-inverse', =>
        @div class: 'navbar-inner', =>
          @div class: 'container', =>
            @ul class: 'nav', =>

            @div class: 'pull-right', =>
              @a class: 'brand', href: '/', =>
                @i class: 'icon-list'
                @span "Hyperarchy"

      @div id: 'pages', outlet: 'pages', =>
        @subview 'homePage', new Views.HomePage
        @subview 'questionPage', new Views.QuestionPage

  initialize: ->
    @hidePages()
    @buildAndStartRouter()
    @on 'click', '#questions .question', (e) =>
      questionId = $(e.target).data('question-id')
      Davis.location.assign "/#{questionId}"

  buildAndStartRouter: ->
    view = this
    Davis ->
      @configure ->
        @generateRequestOnPageLoad = true

      @get '/:questionId', ({params}) ->
        Davis.location.assign("/questions/#{params.questionId}")

      @get '/questions/:questionId', ({params}) ->
        view.showPage('questionPage').setQuestionId(params.questionId)

      @get '/', ->
        view.showPage('homePage')

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

class Views.Application extends View
  @content: ->
    @div id: 'application', =>
      @div class: 'navbar navbar-fixed-top navbar-inverse', =>
        @div class: 'navbar-inner', =>
          @div class: 'container', =>
            @ul class: 'nav', =>
              @li =>
                @a href: "/", id: 'all-questions-link', =>
                  @i class: 'icon-chevron-left'
                  @text " All Questions"

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

  buildAndStartRouter: ->
    view = this
    Davis ->
      @configure ->
        @generateRequestOnPageLoad = true

      @get '/questions/archived', ->
        view.showPage('homePage')

      @get '/questions/:questionId', ({params}) ->
        { questionId } = params
        view.showQuestionPage(questionId).showCombinedRanking()

      @get '/questions/:questionId/new', ({params}) ->
        { questionId } = params
        view.showQuestionPage(questionId).showNewAnswers()

      @get '/questions/:questionId/rankings/:voterId', ({params}) ->
        { questionId, voterId } = params
        view.showQuestionPage(questionId).showRanking(parseInt(voterId))

      # for backward-compatibility w/ old url scheme
      @get '/:questionId', ({params}) ->
        Davis.location.assign("/questions/#{params.questionId}")

      @get '/', ->
        view.showPage('homePage')

  hidePages: ->
    @pages.children().hide()

  showPage: (outletName) ->
    @hidePages()
    this[outletName].show()

  showQuestionPage: (questionId) ->
    page = @showPage('questionPage')
    page.setQuestionId(parseInt(questionId))
    page

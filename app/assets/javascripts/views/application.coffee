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
                @span APP_NAME

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
        view.navigate('homePage', state: 'archived')

      @get '/questions/:questionId', ({params}) ->
        { questionId } = params
        view.navigateToQuestion(questionId, state: 'combinedRanking')

      @get '/questions/:questionId/new', ({params}) ->
        { questionId } = params
        view.navigateToQuestion(questionId, state: 'newAnswers')

      @get '/questions/:questionId/rankings/:voterId', ({params}) ->
        { questionId, voterId } = params
        view.navigateToQuestion(questionId, state: 'singleRanking', voterId: parseInt(voterId))

      @get '/questions', ({params}) ->
        view.navigate('homePage', state: 'active')

      @get '/', ->
        Davis.location.assign("/questions")

  hidePages: ->
    @pages.children().hide()

  navigate: (outletName, params) ->
    page = this[outletName]
    throw new Error("No page named '#{outletName}'") unless page
    if typeof page.fetchData is 'function'
      page.fetchData(params).success =>
        @hidePages()
        page.navigate(params)
    else
      @hidePages()
      page.navigate(params)
    page

  navigateToQuestion: (questionId, params) ->
    if questionId.match(/^[a-z]/)
      secret = questionId
      questionId = null
    else
      questionId = parseInt(questionId)

    @navigate('questionPage', _.extend({}, params, {questionId, secret}))

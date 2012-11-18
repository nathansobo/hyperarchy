class Views.QuestionListItem extends View
  @content: (question) ->
    @div class: 'question', =>
      @div question.body(), class: 'body lead'
      @div class: 'answers', =>

  initialize: (@question) ->
    @click => Davis.location.assign("/#{@question.id()}")

  remove: (selector, keepData) ->
    super
    @answerList.remove() unless keepData

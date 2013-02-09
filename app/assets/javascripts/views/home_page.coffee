{Question, User} = Models

class Views.HomePage extends View
  @content: ->
    @div id: 'home-page', class: 'container', =>

      @header =>
        @button "+ New Question", class: 'btn btn-large btn-primary pull-right', click: 'addQuestion'
        @button "Show archived", class: 'pull-right btn btn-large', 'data-toggle': 'button', click: 'toggleArchived'
        @h1 "", outlet: 'questionsHeader'

      @subview 'questionsList', new Views.RelationView(
        attributes: { id: 'questions' }
        buildItem: (question) ->
          $$ ->
            @li =>
              @a class: 'question', href: "/questions/#{question.id()}", =>
                @i class: 'icon-chevron-right icon-large'
                @img src: question.creator().avatarUrl()
                @div question.body(), class: "body"
      )

  initialize: ->
    @questionsList.onInsert = => @updateQuestionsHeader()
    @questionsList.onRemove = => @updateQuestionsHeader()

  show: ->
    super
    $('#all-questions-link').hide()
    @fetchPromise ?= Monarch.Remote.Server.fetch([User.where(id: User.currentUserId), Question.join(User, creatorId: 'User.id')]).onSuccess => @toggleArchived()

  updateQuestionsHeader: ->
    size = @questionsList.relation.size()
    if size == 1
      @questionsHeader.text("1 Question")
    else
      @questionsHeader.text("#{size} Questions")

  toggleArchived: ->
    if @showArchived
      console.log('showing archived')
      @questionsList.setRelation(Question.where('archivedAt >': null))
    else
      @questionsList.setRelation(Question.where(archivedAt: null))
    @showArchived = !@showArchived

    return true

  addQuestion: ->
    new Views.ModalForm(
      headingText: "Ask an open-ended question:"
      buttonText: "Ask Question"
      onSubmit: (body) =>
        Question.create({body})
          .onSuccess (question) =>
            Davis.location.assign("/questions/#{question.id()}")
    )

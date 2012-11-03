{ Question, Answer, User, Ranking, Vote, QuestionComment } = Models

class Views.QuestionPage extends View
  @content: ->
    @div id: 'question-page', =>
      @header =>
        @div class: 'container', =>
          @div class: 'row', =>
            @div class: 'span24', =>
              @div id: 'question-creator-links', class: 'pull-right hide', outlet: 'questionCreatorLinks', =>
                @a class: 'delete pull-right', outlet: 'deleteButton', click: 'deleteQuestion', =>
                  @i class: 'icon-trash'
                  @text " Delete"
                @a class: 'edit-body pull-right', outlet: 'editButton', click: 'editQuestionBody', =>
                  @i class: 'icon-edit'
                  @text " Edit"
              @img id: 'creator-avatar', class: 'img-rounded pull-right', outlet: 'creatorAvatar'
              @h1 outlet: 'body', class: 'body'

      @div class: 'container', =>
        @div class: 'row', =>
          @div class: 'span6', =>
            @ul class: 'nav nav-tabs nav-stacked left-nav', =>
              @li =>
                @a class: 'selected', =>
                  @i class: 'icon-chevron-right'
                  @span "Combined Opinion"
              @li =>
                @a =>
                  @i class: 'icon-chevron-right'
                  @span "New Answers"
              @li =>
                @a =>
                  @i class: 'icon-chevron-right'
                  @span "Unranked Answers"
              @li =>
                @a =>
                  @i class: 'icon-chevron-down'
                  @span "Individual Opinions"


          @div class: 'span9', =>
            @h4 "Combined Ranking", class: 'collective list-header'
            @subview 'answerList', new Views.RelationView(
              attributes: { class: 'collective answer-list' }
              buildItem: (answer, index) -> new Views.AnswerItem(answer, index, draggable: true)
              updateIndex: (item, index) -> item.find('.index').text(index + 1)
            )

          @div class: 'span9', =>
            @h4 class: 'list-header', =>
              @text "Your Ranking"
              @button "+ Add Answer", class: 'btn btn-small btn-primary pull-right', click: 'addAnswer'

            @div class: 'personal-vote-wrapper', =>
              @subview 'personalVote', new Views.RelationView(
                attributes: { class: 'personal answer-list' }
                buildItem: (ranking, index) -> new Views.AnswerItem(ranking.answer(), index, position: ranking.position())
                updateIndex: (item, index) -> item.find('.index').text(index + 1)
              )
              @div class: 'voting-instructions', outlet: 'votingInstructions', =>
                @div class: 'icons img-rounded', =>
                  @i class: 'large icon-arrow-right'
                  @i class: 'large icon-list-ol'
                @div class: 'words lead', "Drag answers here to influence the collective ranking"
#
#       @div class: 'row', =>
#
#         @div class: 'span4', =>
#           @h5 'Discussion', class: 'column-header', outlet: 'discussionHeader'
#           @subview 'discussion', new Views.DiscussionView()
#
  initialize: (question) ->
    @subscriptions = new Monarch.Util.SubscriptionBundle

    @personalVote.buildItem = (ranking, index) =>
      @buildAnswerItem(ranking.answer(), index, position: ranking.position())

    @personalVote.onInsert = (item, ranking) =>
      @rankedItemsByAnswerId[ranking.answerId()]?.remove()
      @rankedItemsByAnswerId[ranking.answerId()] = item
      @updateRankIndicators()
      @updateVotingInstructions()

    @personalVote.onUpdate = =>
      @updateRankIndicators()

    @personalVote.onRemove = =>
      @updateRankIndicators()
      @updateVotingInstructions()

    removeItem = null
    @personalVote.sortable(
      receive: -> removeItem = 0
      over: -> removeItem = 0
      out: -> removeItem = 1
      beforeStop: (event, ui) -> ui.item.detach() if removeItem
      stop: (event, ui) => @updateAnswerRanking(ui.item)
    )

    @setQuestion(question)

  setQuestionId: (questionId) ->
    questionId = parseInt(questionId)
    questionRelations = [Answer, Ranking, Vote].map (r) -> r.where({questionId})
    Monarch.Remote.Server.fetch([User, Question.where(id: questionId), questionRelations...])
      .onSuccess => @setQuestion(Question.find(questionId))

  setQuestion: (@question) ->
    return unless @question?

    @subscriptions.destroy()
    @rankedItemsByAnswerId = {}

    @creatorAvatar.attr('src', @question.creator().avatarUrl())
    @body.text(@question.body())
    question.getField('body').onChange (body) => @body.text(body)

    @answerList.setRelation(question.answers())
    @personalVote.setRelation(Models.User.getCurrent().rankingsForQuestion(question))
    @updateVotingInstructions()

#     @subscriptions.add @question.comments().onInsert => @updateDiscussionHeader()
#     @subscriptions.add @question.comments().onRemove => @updateDiscussionHeader()
#     @updateDiscussionHeader()
#
#     @discussion.setComments(@question.comments())
#
    if @question.creator() == Models.User.getCurrent()
      @questionCreatorLinks.show()
    else
      @questionCreatorLinks.hide()

  buildAnswerItem: (answer, index, options) ->
    new Views.AnswerItem(answer, index, options)

  showCollectiveVote: ->

  showAllVotes: ->

  updateShowAllVotesLink: ->
    count = @question.votes().size()

    if count == 0
      @showAllVotesLink.addClass('double-disabled')
    else
      @showAllVotesLink.removeClass('double-disabled')

    if count == 1
      @showAllVotesLink.text("1 Individual Ranking")
    else
      @showAllVotesLink.text("#{count} Individual Rankings")

  enableLink: (link) ->
    link.removeClass('disabled')

  disableLink: (link) ->
    link.addClass('disabled')

  updateAnswerRanking: (item) ->
    answerId = item.data('answer-id')
    answer = Models.Answer.find(answerId)

    unless item.parent().length
      Models.Ranking.destroyByAnswerId(answerId)
        .done => @highlightAnswerInCollectiveRanking(answer, true)
      delete @rankedItemsByAnswerId[answerId]
      item.remove()
      return

    existingItem = @rankedItemsByAnswerId[answerId]
    if existingItem and existingItem[0] != item[0]
      item.replaceWith(existingItem.detach())
      item = existingItem
    @rankedItemsByAnswerId[answerId] = item

    lowerPosition = item.next()?.data('position') ? 0
    if item.prev().length
      upperPosition = item.prev().data('position')
      position = (upperPosition + lowerPosition) / 2
    else
      position = lowerPosition + 1

    item.data('position', position)
    @personalVote.updateIndices()

    Models.Ranking.createOrUpdate(
      answer: answer
      position: position
    )
      .done =>
        @highlightAnswerInCollectiveRanking(answer, true)

  addAnswer: ->
    new Views.ModalForm(
      headingText: @question.body()
      buttonText: "Add Answer"
      onSubmit: (body) =>
        @question.answers().create({body})
          .onSuccess (answer) =>
            answerItem = @answerList.find(".answer[data-answer-id=#{answer.id()}]").view().buildDragHelper()
            @personalVote.prepend(answerItem)
            @updateAnswerRanking(answerItem)
    )

  editQuestionBody: ->
    new Views.ModalForm(
      text: @question.body()
      headingText: 'Edit your question:'
      buttonText: "Save Changes"
      onSubmit: (body) =>
        @question.update({body})
    )

  deleteQuestion: ->
    if confirm("Are you sure you want to delete this question?")
      @question.destroy()

  highlightAnswerInCollectiveRanking: (answer, delay) ->
    if delay
      subscription = @question.onUpdate =>
        subscription.destroy()
        fn = => @highlightAnswerInCollectiveRanking(answer)
        _.delay(fn, 30)
      return

    item = @answerList.find(".answer[data-answer-id=#{answer.id()}]")

    if item.position().top < 0 or item.position().top > @answerList.height()
      @answerList.scrollTo(item, over: -.5)
    item.effect('highlight')

  updateRankIndicators: ->
    @answerList.find('.answer').each ->
      $(this).view().updateRankIndicator()

  updateDiscussionHeader: ->
    count = @question.comments().size()
    if count == 1
      @discussionHeader.text("1 Comment")
    else
      @discussionHeader.text("#{count} Comments")

  updateVotingInstructions: ->
    if Models.User.getCurrent().rankingsForQuestion(@question).isEmpty()
      @votingInstructions.show()
    else
      @votingInstructions.hide()

  remove: (selector, keepData) ->
    super
    unless keepData
      @answerList.remove()
      @personalVote.remove()
      @allVotes.remove()
      @discussion.remove()
      @subscriptions.destroy()

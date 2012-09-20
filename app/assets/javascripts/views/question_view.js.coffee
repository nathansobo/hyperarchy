class Views.QuestionView extends View
  @content: (question) ->
    @div class: 'question', =>
      @div class: 'row header', =>
        @div class: 'span8', =>
          @div class: 'body lead', outlet: 'body'
        @div class: 'span4', =>
          @button class: 'delete btn btn-link pull-right', outlet: 'deleteButton', click: 'deleteQuestion', =>
            @i class: 'icon-trash'
            @span "Delete"

          @button class: 'edit-body btn btn-link pull-right', outlet: 'editButton', click: 'editQuestionBody', =>
            @i class: 'icon-edit'
            @span "Edit"

      @div class: 'row', =>
        @div class: 'span4', =>
          @h5 =>
            @a "Collective Ranking", class: 'no-href disabled', click: 'showCollectiveVote', outlet: 'showCollectiveVoteLink'
            @i class: 'separator small icon-caret-left'
            @a "Individual Rankings", class: 'no-href', click: 'showAllVotes', outlet: 'showAllVotesLink'

          @subview 'collectiveVote', new Views.RelationView(
            attributes: { class: 'collective vote column' }
          )

          @subview 'allVotes', new Views.RelationView(
            attributes: { class: 'all-votes column hide' }
            buildItem: (vote) -> new Views.VoteView(vote)
          )

        @div class: 'span4', =>
          @h5 =>
            @button "+ Add Answer", class: 'btn btn-small btn-primary add-answer pull-right', click: 'addAnswer'
            @text "Your Ranking"

          @div class: 'personal-vote-wrapper', =>
            @subview 'personalVote', new Views.RelationView(
              attributes: { class: 'personal vote column' }
            )
            @div class: 'voting-instructions', outlet: 'votingInstructions', =>
              @div class: 'icons img-rounded', =>
                @i class: 'large icon-arrow-right'
                @i class: 'large icon-list-ol'
              @div class: 'words lead', "Drag answers here to influence the collective ranking"

        @div class: 'span4', =>
          @h5 'Discussion', outlet: 'discussionHeader'
          @subview 'discussion', new Views.DiscussionView(question.comments())

  initialize: (@question) ->
    @rankedItemsByAnswerId = {}
    @body.text(question.body())

    @collectiveVote.buildItem = (answer) => @buildAnswerItem(answer, draggable: true)
    @collectiveVote.setRelation(question.answers())

    @updateVotingInstructions()
    @subscriptions = new Monarch.Util.SubscriptionBundle
    personalRankings = Models.User.getCurrent().rankingsForQuestion(question)

    @subscriptions.add personalRankings.onInsert =>
      @updateRankIndicators()
      @updateVotingInstructions()

    @subscriptions.add personalRankings.onUpdate =>
      @updateRankIndicators()

    @subscriptions.add personalRankings.onRemove =>
      @updateRankIndicators()
      @updateVotingInstructions()

    @personalVote.buildItem = (ranking) =>
      @buildAnswerItem(ranking.answer(), position: ranking.position())
    @personalVote.onInsert = (item, ranking) =>
      @rankedItemsByAnswerId[ranking.answerId()]?.remove()
      @rankedItemsByAnswerId[ranking.answerId()] = item

    @personalVote.setRelation(personalRankings)

    removeItem = null
    @personalVote.sortable(
      receive: -> removeItem = 0
      over: -> removeItem = 0
      out: -> removeItem = 1
      beforeStop: (event, ui) -> ui.item.detach() if removeItem
      stop: (event, ui) => @updateAnswerRanking(ui.item)
    )

    @allVotes.setRelation(@question.votes())

    @subscriptions.add @question.votes().onInsert => @updateShowAllVotesLink()
    @subscriptions.add @question.votes().onRemove => @updateShowAllVotesLink()
    @updateShowAllVotesLink()

    @subscriptions.add @question.comments().onInsert => @updateDiscussionHeader()
    @subscriptions.add @question.comments().onRemove => @updateDiscussionHeader()
    @updateDiscussionHeader()

    unless @question.creator() == Models.User.getCurrent()
      @editButton.hide()
      @deleteButton.hide()

    question.getField('body').onChange (body) =>
      @body.text(body)

  buildAnswerItem: (answer, options) ->
    new Views.AnswerItem(answer, options)

  showCollectiveVote: ->
    @enableLink(@showAllVotesLink)
    @disableLink(@showCollectiveVoteLink)
    @allVotes.hide()
    @collectiveVote.show()

  showAllVotes: ->
    return unless @question.votes().size()
    @enableLink(@showCollectiveVoteLink)
    @disableLink(@showAllVotesLink)
    @collectiveVote.hide()
    @allVotes.show()

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
            answerItem = @collectiveVote.find(".answer[data-answer-id=#{answer.id()}]").view().buildDragHelper()
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

    item = @collectiveVote.find(".answer[data-answer-id=#{answer.id()}]")

    if item.position().top < 0 or item.position().top > @collectiveVote.height()
      @collectiveVote.scrollTo(item, over: -.5)
    item.effect('highlight')

  updateRankIndicators: ->
    @collectiveVote.find('.answer').each ->
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
      @collectiveVote.remove()
      @personalVote.remove()
      @allVotes.remove()
      @discussion.remove()
      @subscriptions.destroy()

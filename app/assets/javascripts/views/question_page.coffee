{ Question, Answer, User, Preference, Ranking, QuestionComment } = Models

class Views.QuestionPage extends View
  @content: ->
    @div id: 'question-page', =>

      @div class: 'container', =>
        @header outlet: 'header', =>
          @img id: 'creator-avatar', class: 'img-rounded pull-left', outlet: 'creatorAvatar'

          @div id: 'question-creator-links', class: 'pull-right hide', outlet: 'questionCreatorLinks', =>
            @a class: 'delete pull-right', outlet: 'deleteButton', click: 'deleteQuestion', =>
              @i class: 'icon-trash'
              @text " Delete"

            @a class: 'pull-right', click: 'toggleQuestionArchived', =>
              @i class: 'icon-flag'
              @span outlet: 'toggleStateButtonText'

            @a class: 'edit-body pull-right', outlet: 'editButton', click: 'editQuestionBody', =>
              @i class: 'icon-edit'
              @text " Edit"

          @h1 outlet: 'body', class: 'body'

        @div id: 'main', outlet: 'mainDiv', =>
          @div id: 'sidebar', =>
            @ul class: 'left-nav', outlet: 'leftNav', =>
              @li =>
                @a outlet: 'combinedRankingLink', =>
                  @i class: 'icon-globe'
              @li =>
                @a outlet: 'individualRankingsLink', click: 'showIndividualRankings', =>
                  @i class: 'icon-group'
              @li =>
                @a outlet: 'newAnswersLink', =>
                  @i class: 'icon-asterisk'
#               @li =>
#                 @a outlet: 'randomizeAnswersLink', =>
#                   @i class: 'icon-random'

          @div id: 'columns', =>
            @div class: 'column', id: 'column1', =>
              @h4 "Combined Ranking", class: 'collective list-header hide', outlet: 'combinedRankingHeader'
              @h4 "Individual Rankings", class: 'collective list-header hide', outlet: 'allRankingsHeader'
              @h4 "New Answers", class: 'collective list-header hide', outlet: 'newAnswersHeader'

              @subview 'answerList', new Views.RelationView(
                attributes: { class: 'collective answer-list' }
                buildItem: (answerOrPreference, index) ->
                  new Views.AnswerItem(answerOrPreference.answer(), index, draggable: true)
                updateIndex: (item, index) -> item.find('.index').text(index + 1)
              )

              @subview 'allRankings', new Views.RelationView(
                attributes: { class: 'all-rankings hide' }
                buildItem: (ranking, index) -> new Views.RankingItem(ranking)
              )

            @div class: 'column', id: 'column2', =>
              @h4 class: 'list-header', outlet: 'column2Header', =>
                @span "Your Ranking", outlet: 'column2HeaderText'
                @button "+ Add Answer", id: 'add-answer-button', class: 'btn btn-small btn-primary pull-right', click: 'addAnswer', outlet: 'addAnswerButton'

              @subview 'personalRanking', new Views.RelationView(
                attributes: { class: 'personal answer-list' }
                buildItem: (preference, index) -> new Views.AnswerItem(preference.answer(), index, position: preference.position())
                updateIndex: (item, index) -> item.find('.index').text(index + 1)
              )
              @div class: 'voting-instructions', outlet: 'votingInstructions', =>
                @div class: 'icons img-rounded', =>
                  @i class: 'large icon-arrow-right'
                  @i class: 'large icon-list-ol'
                @div class: 'words lead', "Drag answers here to influence the collective ranking"

            @div class: 'column', id: 'column3', =>
              @h4 'Discussion', id: 'discussion-header', outlet: 'discussionHeader'
              @subview 'discussion', new Views.DiscussionView()

  initialize: (question) ->
    @subscriptions = new Monarch.Util.SubscriptionBundle

    @personalRanking.onInsert = (item, preference) =>
      @rankedItemsByAnswerId[preference.answerId()]?.remove()
      @rankedItemsByAnswerId[preference.answerId()] = item
      @updateRankIndicators()
      @updateVotingInstructions()

    @personalRanking.onUpdate = =>
      @updateRankIndicators()

    @personalRanking.onRemove = =>
      @updateRankIndicators()
      @updateVotingInstructions()

    removeItem = null
    @personalRanking.sortable(
      appendTo: '#question-page'
      helper: (e, item) -> item.view().buildDragHelper()
      receive: -> removeItem = 0
      over: -> removeItem = 0
      out: -> removeItem = 1
      beforeStop: (event, ui) -> ui.item.detach() if removeItem
      stop: (event, ui) => @updateAnswerPreference(ui.item)
    )

    @setQuestion(question)

  setQuestionId: (questionId) ->
    return if @questionId == questionId
    @questionId = questionId
    questionRelations = [Answer, Preference, Ranking, QuestionComment].map (r) -> r.where({questionId})
    @fetchPromise = Monarch.Remote.Server.fetch([User, Question.where(id: questionId), questionRelations...])
      .onSuccess => @setQuestion(Question.find(questionId))

  setQuestion: (@question) ->
    return unless @question?

    @subscriptions.destroy()
    @rankedItemsByAnswerId = {}

    @creatorAvatar.attr('src', @question.creator().avatarUrl())
    @updateQuestionBody()
    @updateToggleQuestionArchivedButton()
    question.getField('body').onChange => @updateQuestionBody()
    $(window).on 'resize', => @adjustTopOfMainDiv()

    @personalRanking.setRelation(Models.User.getCurrent().preferencesForQuestion(question))
    @updateVotingInstructions()

    @subscriptions.add @question.rankings().onInsert => @updateAllRankingsHeader()
    @subscriptions.add @question.rankings().onRemove => @updateAllRankingsHeader()
    @updateAllRankingsHeader()

    @subscriptions.add @question.comments().onInsert => @updateDiscussionHeader()
    @subscriptions.add @question.comments().onRemove => @updateDiscussionHeader()
    @updateDiscussionHeader()
    @discussion.setComments(@question.comments())

    @combinedRankingLink.attr('href', "/questions/#{@question.id()}")
    @newAnswersLink.attr('href', "/questions/#{@question.id()}/new")

    if @question.creator() == Models.User.getCurrent()
      @questionCreatorLinks.show()
    else
      @questionCreatorLinks.hide()

    @subscriptions.add @question.onDestroy =>
      window.alert("This question has been deleted") unless @skipDestroyAlert
      @skipDestroyAlert = false
      Davis.location.assign('/')

    @selectedRankingUserId = null

    @question.getField('archived').onChange @updateArchivedClass
    @updateArchivedClass()

  show: ->
    $('#all-questions-link').show()
    super

  showColumn1Header: (header) ->
    @find('#column1 .list-header').hide()
    header.show()

  showCombinedRanking: ->
    @fetchPromise.onSuccess =>
      @showAnswerList()
      @showPersonalRanking()
      @highlightLeftNavLink(@combinedRankingLink)
      @showColumn1Header(@combinedRankingHeader)
      @answerList.setRelation(@question.answers())

  showNewAnswers: ->
    @fetchPromise.onSuccess =>
      @showAnswerList()
      @showPersonalRanking()
      @highlightLeftNavLink(@newAnswersLink)
      @showColumn1Header(@newAnswersHeader)
      if newAnswers = @question.newAnswers()
        @answerList.setRelation(newAnswers)

  showRanking: (userId) ->
    @selectedRankingUserId = userId
    @fetchPromise.onSuccess =>
      @highlightLeftNavLink(@individualRankingsLink)

      ranking = @question.rankings().find({userId})

      @showAllRankings()
      @allRankings.find(".selected").removeClass('selected')
      @allRankings.find("[data-ranking-id=#{ranking.id()}]").addClass('selected')

      @column2HeaderText.text("#{ranking.user().fullName()}'s Ranking")
      @addAnswerButton.hide()
      @personalRanking.setRelation(ranking.preferences())
      @votingInstructions.hide()
      if ranking.userId() == User.currentUserId
        @personalRanking.sortable('enable')
      else
        @personalRanking.sortable('disable')

  showIndividualRankings: ->
    ranking = @question.rankings().find({userId: @selectedRankingUserId}) if @selectedRankingUserId
    ranking ?= @question.rankings().first()
    return unless ranking
    Davis.location.assign("/questions/#{@question.id()}/rankings/#{ranking.userId()}")

  highlightLeftNavLink: (link) ->
    @leftNav.find('a').removeClass('selected')
    link.addClass('selected')

  showAllRankings: ->
    @answerList.hide()
    @allRankings.show()
    @showColumn1Header(@allRankingsHeader)
    @allRankings.setRelation(@question.rankings())

  showAnswerList: ->
    @allRankings.hide()
    @answerList.show()

  showPersonalRanking: ->
    @column2HeaderText.text("Your Ranking")
    @addAnswerButton.show()
    @personalRanking.sortable('enable')
    @personalRanking.setRelation(Models.User.getCurrent().preferencesForQuestion(@question))
    @updateVotingInstructions()

  updateAllRankingsHeader: ->
    count = @question.rankings().size()
    if count == 1
      @allRankingsHeader.text("1 Individual Ranking")
    else
      @allRankingsHeader.text("#{count} Individual Rankings")

  updateToggleQuestionArchivedButton: ->
    if @question.archived()
      @toggleStateButtonText.text(" Reopen")
    else
      @toggleStateButtonText.text(' Archive')

  updateAnswerPreference: (item) ->
    answerId = item.data('answer-id')
    answer = Models.Answer.find(answerId)

    unless item.parent().length
      Preference.destroyByAnswerId(answerId)
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
    @personalRanking.updateIndices()

    Preference.createOrUpdate(
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
            @personalRanking.prepend(answerItem)
            @updateAnswerPreference(answerItem)
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
      @skipDestroyAlert = true
      @question.destroy()

  toggleQuestionArchived: ->
    if @question.archived()
      query = @question.update(archivedAt: 0)
    else
      query = @question.update(archivedAt: new Date())
    query.onSuccess (question) => @updateToggleQuestionArchivedButton()

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
    if Models.User.getCurrent().preferencesForQuestion(@question).isEmpty()
      @votingInstructions.show()
    else
      @votingInstructions.hide()

  updateQuestionBody: ->
    @body.text(@question.body())
    @adjustTopOfMainDiv()

  adjustTopOfMainDiv: ->
    @mainDiv.css('top', @header.outerHeight())

  updateArchivedClass: =>
    if @question.archived()
      @addClass 'archived'
    else
      @removeClass 'archived'

  remove: (selector, keepData) ->
    super
    unless keepData
      @answerList.remove()
      @personalRanking.remove()
      @allRankings.remove()
      @discussion.remove()
      @subscriptions.destroy()

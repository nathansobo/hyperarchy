class Views.VoteView extends View
  @content: ->
    @li class: 'vote', =>
      @div class: 'header', =>
        @img class: 'avatar', outlet: 'avatar'
        @div class: 'name', outlet: 'name'
        @time class: 'updated-at', outlet: 'updatedAt'
      @subview 'answerList', new Views.RelationView(
        buildItem: (answer) ->
          $$ -> @li answer.body()
      )

  initialize: (@vote) ->
    @avatar.attr('src', vote.user().avatarUrl())
    @name.text(vote.user().fullName())
    @refreshUpdatedAt()
    @updatedAtSubscription = @vote.getField('updatedAt').onChange => @refreshUpdatedAt()
    @answerList.setRelation(@vote.rankings().joinThrough(Models.Answer))

  refreshUpdatedAt: ->
    @updatedAt.data('timeago', datetime: @vote.updatedAt())
    @updatedAt.text($.timeago(@vote.updatedAt()))

  remove: (selector, keepData) ->
    super
    unless keepData
      @answerList.remove()
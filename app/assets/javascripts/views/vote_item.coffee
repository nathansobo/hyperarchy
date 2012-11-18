class Views.VoteItem extends View
  @content: (vote) ->
    @li =>
      @a class: 'vote', 'data-vote-id': vote.id(), href: "/questions/#{vote.questionId()}/rankings/#{vote.userId()}", =>
        @i class: 'icon-chevron-right'
        @img class: 'avatar', outlet: 'avatar'
        @div class: 'name', outlet: 'name'
        @time class: 'updated-at', outlet: 'updatedAt'

  initialize: (@vote) ->
    @avatar.attr('src', vote.user().avatarUrl())
    @name.text(vote.user().fullName())
    @refreshUpdatedAt()
    @updatedAtSubscription = @vote.getField('updatedAt').onChange => @refreshUpdatedAt()

  refreshUpdatedAt: ->
    @updatedAt.data('timeago', datetime: @vote.updatedAt())
    @updatedAt.text($.timeago(@vote.updatedAt()))

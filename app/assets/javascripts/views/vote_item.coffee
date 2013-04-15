class Views.RankingItem extends View
  @content: (ranking) ->
    @li =>
      @a class: 'ranking', 'data-ranking-id': ranking.id(), href: ranking.getUrl(), =>
        @i class: 'icon-chevron-right'
        @img class: 'avatar', outlet: 'avatar'
        @div class: 'name', outlet: 'name'
        @time class: 'updated-at', outlet: 'updatedAt'

  initialize: (@ranking) ->
    @avatar.attr('src', ranking.user().avatarUrl())
    @name.text(ranking.user().fullName())
    @refreshUpdatedAt()
    @updatedAtSubscription = @ranking.getField('updatedAt').onChange => @refreshUpdatedAt()

  refreshUpdatedAt: ->
    @updatedAt.data('timeago', datetime: @ranking.updatedAt())
    @updatedAt.text($.timeago(@ranking.updatedAt()))

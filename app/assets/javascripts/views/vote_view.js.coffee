class Views.VoteView extends View
  @content: ->
    @li class: 'vote', =>
      @img class: 'avatar', outlet: 'avatar'
      @div class: 'name', outlet: 'name'
      @time class: 'updated-at', outlet: 'updatedAt'

  initialize: (vote) ->
    @avatar.attr('src', vote.user().avatarUrl())
    @name.text(vote.user().fullName())
    @updatedAt.data('timeago', datetime: vote.updatedAt())
    @updatedAt.text($.timeago(vote.updatedAt()))

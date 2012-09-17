class Views.VoteView extends View
  @content: ->
    @li class: 'vote row', =>
      @img outlet: 'avatar'

  initialize: (vote) ->
    @avatar.attr('src', vote.user().avatarUrl())

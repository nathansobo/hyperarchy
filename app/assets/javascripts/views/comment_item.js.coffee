class Views.CommentItem extends View
  @content: (comment) ->
    @li class: 'comment', =>
      @img src: comment.creator().avatarUrl()

      @div class: 'header', =>
        @span comment.creator().fullName(), class: 'name'
        @subview 'createdAt', new Views.TimestampView(date: comment.createdAt())
      @raw markdown.toHTML(comment.body())

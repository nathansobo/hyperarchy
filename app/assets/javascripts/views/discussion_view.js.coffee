class Views.DiscussionView extends View
  @content: ->
    @div class: 'discussion column', =>
      @subview 'commentsList', new Views.RelationView(
        buildItem: (comment) -> new Views.CommentItem(comment)
      )
      @div class: 'text-entry', =>
        @textarea rows: 2, outlet: 'commentTextarea'
        @button "Submit Comment", class: 'btn pull-right', click: 'createComment'

  initialize: (@comments) ->
    @commentsList.setRelation(@comments)

  createComment: ->
    body = @commentTextarea.val()
    if /\S/.test(body)
      @question.comments().create({body})

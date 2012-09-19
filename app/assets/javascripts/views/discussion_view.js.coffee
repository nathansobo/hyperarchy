class Views.DiscussionView extends View
  @content: ->
    @div class: 'discussion column', =>
      @subview 'commentsList', new Views.RelationView(
        buildItem: (comment) -> new Views.CommentItem(comment)
      )
      @div class: 'text-entry', =>
        @textarea rows: 2, outlet: 'commentTextarea'
        @button "Submit Comment", class: 'btn pull-right', click: 'createComment'

  autoScroll: true

  initialize: (@comments) ->
    @commentsList.scroll => @assignAutoscroll()
    @commentsList.onInsert = => @scrollToBottom() if @autoScroll
    @commentsList.setRelation(@comments)

  afterAttach: ->
    @scrollToBottom()

  createComment: ->
    body = @commentTextarea.val()
    if /\S/.test(body)
      @comments.create({body})

  scrollToBottom: ->
    @commentsList.scrollTop(@maxScroll())

  maxScroll: ->
    @commentsList.scrollTop() + @commentsList.outerHeight()

  assignAutoscroll: ->
    @autoScroll = (@commentsList.prop('scrollHeight') == @maxScroll())
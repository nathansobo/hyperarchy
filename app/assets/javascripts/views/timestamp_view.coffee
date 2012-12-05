class Views.TimestampView extends View
  @content: (options) ->
    @time options.attributes ? {}

  initialize: ({date}) ->
    @setDate(date) if date?

  setDate: (date) ->
    @data('timeago', datetime: date)
    @text($.timeago(date))

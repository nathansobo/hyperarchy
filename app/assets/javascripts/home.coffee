window.initialize = ->
  $ ->
    Monarch.subscribe(PUSHER_CHANNEL)
    $('body').append(new Views.Application)
    $('time').timeago()

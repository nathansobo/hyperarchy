window.initialize = ->
  $ ->
    PUBNUB.subscribe(
      channel: PUBNUB_CHANNEL
      callback: (operation) ->
        console.log "got operation", _.clone(operation)
        Monarch.Repository.update(operation)
    )

    $('body').append(new Views.Application)
    $('time').timeago()

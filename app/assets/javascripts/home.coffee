window.initialize = ->
  $ ->
    $('body').append(new Views.Application)
    $('time').timeago()

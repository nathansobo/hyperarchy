#= require 'application'
#= require 'monarch_test_support'
#= require_self
#= require_tree .

Monarch.useFakeServer()
window.Pusher = {}

beforeEach ->
  $('#test-content').remove()
  $('body').append $$ -> @div id: 'test-content'
  Monarch.Remote.Server.reset()

$.fn.attachToDom = ->
  @appendTo('#test-content')

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
  Monarch.Repository.clear()

afterEach ->
  expect(Monarch.Repository.subscriptionCount()).toBe 0

$.fn.attachToDom = ->
  @appendTo('#test-content')

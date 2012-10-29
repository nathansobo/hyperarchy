#= require 'application'
#= require 'monarch/lib/monarch_test_support'
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
  for name, table of Monarch.Repository.tables
    if table.subscriptionCount() > 0
      throw new Error("Table #{name} has a subscription count of #{table.subscriptionCount()}")

$.fn.attachToDom = ->
  @appendTo('#test-content')

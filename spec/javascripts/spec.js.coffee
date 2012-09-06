#= require 'application'
#= require 'monarch_test_support'
#= require_tree .

Monarch.useFakeServer()
window.Pusher = {}


beforeEach ->
  resetTestContent()

window.resetTestContent = ->
  $('body').append $$ ->
    @div id: 'test-content'

$.fn.attachToDom = ->
  @appendTo('#test-content')

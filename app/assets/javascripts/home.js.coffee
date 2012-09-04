$ ->
  pusher = new Pusher(PUSHER_API_KEY)
  channel = pusher.subscribe('global')
  channel.bind 'operation', (data) -> console.log(data)

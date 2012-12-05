PUBNUB = Pubnub.new(
  :publish_key => ENV['PUBNUB_PUBLISH_KEY'],
  :subscribe_key => ENV['PUBNUB_SUBSCRIBE_KEY'],
#   :secret_key => ENV['PUBNUB_SECRET_KEY'],
  :ssl => true
)

PUBNUB_CHANNEL = ENV['PUBNUB_CHANNEL']

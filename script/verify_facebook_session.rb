require 'json'
require 'digest/md5'


APP_SECRET = '1cdc8ebd9c410a0ca605504eef38413c'

def verify(session_json)
  session = JSON.parse(session_json)
  signature = session.delete('sig')

  payload = ""
  session.sort.each do |pair|
    key, value = pair
    payload += "#{key}=#{value}"
  end

  computed_signature = Digest::MD5.hexdigest(payload + APP_SECRET)
  puts computed_signature
  signature == computed_signature
end

p verify('{"access_token":"207827675895197|2.AQCB91eFE4vCUaUo.3600.1310497200.1-650539382|ieAmpWbKULRfjnv2-AwaGY4RelA","base_domain":"hyperarchy.com","expires":1310497200,"secret":"5wPTlEulSDQXzLXrwP7djg__","session_key":"2.AQCB91eFE4vCUaUo.3600.1310497200.1-650539382","sig":"cc19f214b9677e604e4e75c79362e82c","uid":"650539382"}')

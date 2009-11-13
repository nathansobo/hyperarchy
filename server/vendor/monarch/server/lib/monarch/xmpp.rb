
dir = File.dirname(__FILE__)


if defined?(XMPP_ENABLED) && XMPP_ENABLED
  require "#{dir}/xmpp/dispatcher"
end 

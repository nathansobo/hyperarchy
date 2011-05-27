$LOAD_PATH << Rails.root.join('vendor', 'prequel', 'lib')
require 'prequel'
require 'prequel_extensions'
require 'guid_generation'
require 'http_client'
autoload :Mailer, 'mailer'

module Hyperarchy
  autoload :Notifier, 'notifier'
  autoload :Emails, 'emails'
end


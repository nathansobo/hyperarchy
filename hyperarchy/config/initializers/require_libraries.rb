$LOAD_PATH << Rails.root.join('vendor', 'prequel', 'lib')
require 'prequel'
autoload :Mailer, 'mailer'

module Hyperarchy
  autoload :Notifier, 'notifier'
  autoload :Emails, 'emails'
end


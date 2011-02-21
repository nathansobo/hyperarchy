$LOAD_PATH << Rails.root.join('vendor', 'monarch', 'lib')
require 'monarch'
autoload :Mailer, 'mailer'

module Hyperarchy
  autoload :Notifier, 'notifier'
  autoload :Emails, 'emails'
end


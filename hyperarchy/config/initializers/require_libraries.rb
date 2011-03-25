$LOAD_PATH << Rails.root.join('vendor', 'prequel', 'lib')
require 'prequel'
require 'prequel_extensions'
autoload :Mailer, 'mailer'

module Hyperarchy
  autoload :Notifier, 'notifier'
  autoload :Emails, 'emails'
end

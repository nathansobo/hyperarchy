$LOAD_PATH << Rails.root.join('lib', 'monarch', 'lib')
autoload :Monarch, 'monarch/lib/monarch'

autoload :Mailer, 'mailer'

module Hyperarchy
  autoload :Notifier, 'notifier'
  autoload :Emails, 'emails'
end


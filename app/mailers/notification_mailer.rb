#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class NotificationMailer < ActionMailer::Base
  default :from => "Hyperarchy <admin@hyperarchy.com>"

  def notification(user, presenter)
    @presenter = presenter

    raise "Should not be emailing this #{user.email_address}" unless user.email_enabled?

    mail :to => user.email_address,
         :subject => @presenter.subject
  end
end

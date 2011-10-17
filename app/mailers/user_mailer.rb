#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class UserMailer < ActionMailer::Base
  default :from => "Hyperarchy <admin@hyperarchy.com>"

  def password_reset(user)
    @user = user
    mail :to => user.email_address,
         :subject => "Reset your Hyperarchy password"
  end
end

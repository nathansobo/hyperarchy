#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class PasswordResetRequestsController < ApplicationController
  def new
  end

  def create
    if user = User.find(:email_address => params[:email_address])
      user.generate_password_reset_token
      UserMailer.password_reset(user).deliver
    else
      flash[:errors] = ["We couldn't find a user with that email address"]
      @email_address = params[:email_address]
      render :template => '/password_reset_requests/new'
    end
  end
end

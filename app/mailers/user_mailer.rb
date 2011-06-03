class UserMailer < ActionMailer::Base
  default :from => "Hyperarchy <admin@hyperarchy.com>"

  def password_reset(user)
    @user = user
    mail :to => user.email_address,
         :subject => "Reset your Hyperarchy password"
  end
end

class AdminMailer < ActionMailer::Base
  default :from => "admin@hyperarchy.com"

  def feedback(user, feedback)
    mail :to => ['max@hyperarchy.com', 'nathan@hyperarchy.com'], :from => user.email_address,
         :subject => "#{user.full_name} has submitted feedback",
         :body => "#{user.full_name}\n#{user.email_address}\n\n#{feedback}"
  end
end

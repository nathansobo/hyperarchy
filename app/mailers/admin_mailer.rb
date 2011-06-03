class AdminMailer < ActionMailer::Base
  include Resque::Mailer

  default :from => "Hyperarchy Admin <admin@hyperarchy.com>"

  def notify_addresses
    ['max@hyperarchy.com', 'nathan@hyperarchy.com']
  end

  def feedback(user, feedback)
    mail :to => notify_addresses,
         :subject => "#{user.full_name} has submitted feedback",
         :body => "#{user.full_name}\n#{user.email_address}\n\n#{feedback}"
  end

  def new_user(user)
    mail :to => ['max@hyperarchy.com', 'nathan@hyperarchy.com'],
         :subject => "New user on #{Rails.env}",
         :body => "#{user.full_name}\n#{user.email_address}\n"
  end
end

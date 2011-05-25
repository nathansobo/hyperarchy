class NotificationMailer < ActionMailer::Base
  default :from => "Hyperarchy <admin@hyperarchy.com>"

  def notification(user, presenter)
    @presenter = presenter

    mail :to => user.email_address,
         :subject => @presenter.subject
  end
end

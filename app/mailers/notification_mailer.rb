class NotificationMailer < ActionMailer::Base
  default :from => "admin@hyperarchy.com"

  def notification(user, period)
    @presenter = Views::NotificationMailer::NotificationPresenter.new(user, period)

    mail :to => user.email_address,
         :subject => @presenter.subject
  end
end

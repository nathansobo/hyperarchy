class NotificationMailer < ActionMailer::Base
  default :from => "Hyperarchy <admin@hyperarchy.com>"

  def notification(user, presenter)
    @presenter = presenter

    raise "Should not be emailing this #{user.email_address}" unless user.email_enabled?

    mail :to => user.email_address,
         :subject => @presenter.subject
  end
end

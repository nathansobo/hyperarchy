class MembershipMailer < ActionMailer::Base
  default :from => "admin@hyperarchy.com"

  def invitation(membership_id)
    membership = Membership.find(membership_id)
    @organization = membership.organization
    @invitation = membership.invitation

    mail :to => @invitation.sent_to_address,
         :subject => "#{@invitation.inviter.full_name} has invited you to join #{@organization.name} on Hyperarchy"
  end

  def confirmation(inviter_id, membership_id)
    inviter = User.find(inviter_id)
    @membership = Membership.find(membership_id)
    @organization = @membership.organization

    mail :to => @membership.email_address,
         :subject => "#{inviter.full_name} has invited you to join #{@organization.name} on Hyperarchy"
  end
end

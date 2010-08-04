require File.expand_path("#{File.dirname(__FILE__)}/thor_helper")

class Admin < Thor
  desc "gen_invitation email, first_name, last_name, [send_email=false] [env=production]", "Generate an invitation."
  def gen_invitation(email, first_name, last_name, send_email=false, env="production")
    require_hyperarchy(env)

    admin = User.find(:email_address => "admin@hyperarchy.com")
    invitation = Invitation.create!(
      :sent_to_address => email,
      :first_name => first_name,
      :last_name => last_name,
      :send_email => send_email,
      :inviter => admin
    )
    puts "Generated invitation:"
    puts "GUID: #{invitation.guid}"
    puts "Signup URL: #{invitation.signup_url}"
  end
end
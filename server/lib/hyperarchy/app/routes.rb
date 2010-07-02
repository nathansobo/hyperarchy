module Hyperarchy
  class App < Sinatra::Base
    get "/" do
      redirect "/app#view=organization" and return if current_user
      render_page Views::Home
    end

    get "/app" do
      redirect redirect "/#logIn" and return unless current_user
      render_page Views::App
    end

    get "/login" do
      render_page Views::Login
    end

    post "/login" do
      warden.logout(:default)
      if warden.authenticate

        if params[:redirected_from]
          redirect params[:redirected_from]
        else
          redirect "/app#view=organization"
        end
      else
        flash[:errors] = warden.errors.full_messages
        flash[:email_address_errors] = warden.errors[:email_address]
        flash[:entered_email_address] = params[:email_address]
        redirect "/#logIn"
      end
    end

    post "/logout" do
      warden.logout(:default)
      redirect "/"
    end

    get "/signup" do
      if params[:invitation_code]
        invitation = validate_invitation_code(params[:invitation_code])
      end

      render_page Views::Signup, :invitation => invitation
    end

    post "/signup" do
      invitation = validate_invitation_code(params[:invitation_code])
      new_user = invitation.redeem(params[:redeem])
      request.env['warden'].set_user(new_user)
      redirect "/app#view=organization"
    end

    get "/confirm_membership/:membership_id" do |membership_id|
      authentication_required

      membership = Membership.find(membership_id)
      membership.update(:pending => false) if membership.user == current_user
      redirect "/app"
    end

    post "/interested" do
      Mailer.send(
        :to => ["admin@hyperarchy.com", "nathansobo+hyperarchy@gmail.com"],
        :from => "admin@hyperarchy.com",
        :subject => "#{params[:email_address]} is interested in Hyperarchy",
        :body => "Their comments: #{params[:comments]}"
      )
      flash[:notification] = "Thanks. We'll contact you soon."
      redirect "/"
    end

    post "/invite" do
      params[:email_addresses].from_json.each do |email_address|
        Invitation.create!(:inviter => current_user, :sent_to_address => email_address)
      end
      successful_json_response
    end
  end
end
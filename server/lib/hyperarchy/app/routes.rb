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

    post "/login" do
      warden.logout(:default)
      if warden.authenticate
        redirect "/app#view=organization"
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
      puts request.host_with_port
      render_page Views::Signup, :invitation_code => params[:invitation_code]
    end

    post "/signup" do
      new_user = User.create!(params)
      request.env['warden'].set_user(new_user)
      successful_json_response("current_user_id" => new_user.id)
    end

    post "/invite" do
      params[:email_addresses].from_json.each do |email_address|
        Invitation.create!(:inviter => current_user, :sent_to_address => email_address)
      end
      successful_json_response
    end
  end
end
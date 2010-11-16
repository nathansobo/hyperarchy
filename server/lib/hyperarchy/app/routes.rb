module Hyperarchy
  class App < Sinatra::Base
    error Monarch::Unauthorized do
      status 401
      warden.custom_failure!
      "Sorry. That action is not authorized."
    end

    get "/" do
      redirect "/app#view=organization" and return if current_user
      render_page Views::Home
    end

    get "/learn_more" do
      render_page Views::LearnMore
    end

    get "/app" do
      redirect redirect "/login" and return unless current_user
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
        redirect "/login"
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

      render_page Views::Signup, :invitation => invitation, :user => User.new
    end

    post "/signup" do
      invitation = validate_invitation_code(params[:invitation_code])
      new_user = invitation.redeem(params[:redeem])

      if new_user.valid?
        request.env['warden'].set_user(new_user)
        redirect "/app#view=organization"
      else
        flash.now[:errors] = new_user.validation_errors
        render_page Views::Signup, :invitation => invitation, :user => new_user
      end
    end

    get "/confirm_membership/:membership_id" do |membership_id|
      authentication_required

      membership = Membership.find(membership_id)
      membership.update(:pending => false) if membership.user == current_user
      redirect "/app#view=organization&organizationId=#{membership.organization_id}"
    end

    post "/interested" do
      Mailer.send(
        :to => ["admin@hyperarchy.com", "nathansobo+hyperarchy@gmail.com"],
        :subject => "#{params[:email_address]} is interested in Hyperarchy",
        :body => "Their comments: #{params[:comments]}"
      )
      flash[:notification] = "Thanks. We'll contact you soon."
      redirect "/"
    end

    post "/invite" do
      rejected = []
      params[:email_addresses].from_json.each do |email_address|
        if Invitation.find(:sent_to_address => email_address)
          rejected.push(email_address)
        else
          Invitation.create!(:inviter => current_user, :sent_to_address => email_address, :send_email => true)
        end
      end
      successful_json_response(:rejected => rejected)
    end

    post "/feedback" do
      Mailer.send(
        :to => ["admin@hyperarchy.com", "nathansobo+hyperarchy@gmail.com"],
        :subject => "#{current_user.full_name} submitted feedback",
        :body => "User id: #{current_user.id}\n\nTheir comments: #{params[:feedback]}"
      )
      successful_json_response
    end

    post "/dismiss_welcome_blurb" do
      current_user.update(:dismissed_welcome_blurb => true)
      successful_json_response
    end

    post "/subscribe_to_organization/:id" do |organization_id|
      organization = Organization.find(organization_id)
      SubscriptionManager.subscribe_to_organization(current_real_time_client, organization)
    end

    post "/rankings" do
      organization = Candidate.find(params[:candidate_id]).election.organization
      unless current_user && organization.has_member?(current_user)
        raise Monarch::Unauthorized
      end

      attributes = { :user_id => current_user.id, :candidate_id => params[:candidate_id] }

      if ranking = Ranking.find(attributes)
        ranking.update(:position => params[:position])
      else
        ranking = Ranking.create!(attributes.merge(:position => params[:position]))
      end
      successful_json_response({:ranking_id => ranking.id}, ranking)
    end
  end
end
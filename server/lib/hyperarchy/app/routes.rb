module Hyperarchy
  class App < Sinatra::Base
    before do
      no_internet_explorer
    end

    error Monarch::Unauthorized do
      status 401
      warden.custom_failure!
      "Sorry. That action is not authorized."
    end

    get "/" do
      use_ssl
      allow_guests
      render_page Views::App
    end

    get "/private/:organization_id/:invitation_code" do
      org_id, code = params[:organization_id], params[:invitation_code]
      if (url_invitation_code_is_valid(code, org_id))
        if (! current_user || current_user.guest?)
          special_guest = Organization.find(org_id).guest
          warden.set_user(special_guest)
        elsif (! current_user.memberships.find(:organization_id => org_id))
          current_user.memberships.create(:organization_id => org_id, :pending => false)
        end
        redirect "/#view=organization&organizationId=#{org_id}"
      else
        warden.set_user(Organization.social.guest) unless current_user
        redirect "/#view=organization&organizationId=#{Organization.social.id}"
      end
    end

    get "/learn_more" do
      redirect_if_logged_in
      render_page Views::LearnMore
    end

    get "/login" do
      use_ssl
      render_page Views::Login
    end

    post "/login" do
      warden.logout(:default)
      if request.xhr?
        xhr_login
      else
        normal_login
      end
    end

    def normal_login
      if warden.authenticate
        if params[:redirected_from]
          redirect params[:redirected_from]
        else
          redirect "/#view=organization"
        end
      else
        flash[:errors] = warden.errors.full_messages
        flash[:email_address_errors] = warden.errors[:email_address]
        flash[:entered_email_address] = params[:email_address]
        redirect "/login"
      end
    end

    def xhr_login
      if warden.authenticate
        successful_json_response({"current_user_id" => current_user.id}, current_user.initial_repository_contents)
      else
        unsuccessful_json_response("errors" => warden.errors.full_messages)
      end
    end

    post "/logout" do
      warden.logout(:default)
      redirect "/"
    end

    get "/request_password_reset" do
      use_ssl
      render_page Views::RequestPasswordReset
    end

    post "/request_password_reset" do
      use_ssl

      email_address = params[:email_address]

      if email_address.blank?
        flash[:errors] = ["You must enter your email address."]
        redirect "/request_password_reset"
        return
      end

      unless user = User.find(:email_address => email_address)
        flash[:errors] = ["No user found with that email address."]
        redirect "/request_password_reset"
        return
      end

      user.generate_password_reset_token

      Hyperarchy.defer do
        Mailer.send(
          :to => email_address,
          :subject => "Reset your Hyperarchy password",
          :body => "Visit https://hyperarchy.com/reset_password?token=#{user.password_reset_token} to reset your password.",
          :erector_class => Emails::PasswordReset,
          :token => user.password_reset_token
        )
      end

      redirect "/sent_password_reset_token"
    end

    get "/sent_password_reset_token" do
      render_page Views::SentPasswordResetToken
    end

    get "/reset_password" do
      user = User.find(:password_reset_token => params[:token]) if params[:token]

      unless params[:token] && user
        flash[:errors] = ["Sorry, that password reset token is not valid. Please request a reset again."]
        redirect "/request_password_reset" 
      end

      render_page Views::ResetPassword, :token => params[:token]
    end

    post "/reset_password" do
      unless params[:password] == params[:password_confirmation]
        flash[:errors] = ["Your password did not match your confirmation. Please try again"]
        return render_page Views::ResetPassword, :token => params[:token]
      end

      user = User.find(:password_reset_token => params[:token]) if params[:token]
      unless params[:token] && user
        flash[:errors] = ["Sorry, that password reset token is not valid. Please request a reset again."]
        redirect "/request_password_reset"
      end

      user.update(:password => params[:password])
      warden.set_user(user)

      redirect "/"
    end

    get "/signup" do
      redirect_if_logged_in
      use_ssl
      if invitation_code = params[:invitation_code] || session[:invitation_code]
        invitation = validate_invitation_code(invitation_code)
        session[:invitation_code] = invitation_code
      end

      render_page Views::Signup, :invitation => invitation, :user => User.new
    end

    post "/signup" do
      if request.xhr?
        xhr_signup
      else
        normal_signup
      end
    end

    def normal_signup
      redirect_if_logged_in

      if invitation_code = session[:invitation_code]
        invitation = validate_invitation_code(invitation_code)
      else
        organization_name = params[:organization][:name]
        if organization_name.blank?
          flash[:errors] = ["You must enter an organization name."]
          redirect "/signup"
          return
        end
      end

      if invitation
        redeem_invitation(invitation)
      else
        create_user_and_organization(organization_name)
      end
    end

    def xhr_signup
      user = User.secure_create(params[:user].from_json)
      if user.valid?
        warden.set_user(user)
        successful_json_response({"current_user_id" => user.id}, user)
      else
        unsuccessful_json_response({"errors" => user.validation_errors_by_column_name.values.flatten })
      end
    end

    def redeem_invitation(invitation)
      new_user = invitation.redeem(params[:user])
      if new_user.valid?
        warden.set_user(new_user)
        session.delete(:invitation_code)
        redirect "/#view=organization&organizationId=#{new_user.organizations.first.id}"
      else
        flash[:errors] = new_user.validation_errors
        redirect "/signup"
      end
    end

    def create_user_and_organization(organization_name)
      new_user = User.secure_create(params[:user])
      if new_user.valid?
        warden.set_user(new_user)
        organization = Organization.create!(:name => organization_name)
        redirect "/#view=organization&organizationId=#{organization.id}"
      else
        flash[:errors] = new_user.validation_errors
        redirect "/signup"
      end
    end

    get "/confirm_membership/:membership_id" do |membership_id|
      authentication_required

      membership = Membership.find(membership_id)
      membership.update(:pending => false) if membership.user == current_user
      redirect "/#view=organization&organizationId=#{membership.organization_id}"
    end

    post "/invite" do
      begin
        email_addresses = Mail::AddressList.new(params[:email_addresses]).addresses.map(&:address)
      rescue Mail::Field::ParseError => e
        halt unsuccessful_json_response
      end

      organizations = params[:organization_ids].from_json.map {|id| Organization.find(id)}

      unless current_user.admin?
        organizations.each do |organization|
          unless organization.members_can_invite? || organization.has_owner?(current_user)
            raise Monarch::Unauthorized
          end
        end
      end

      memberships = organizations.map do |organization|
        email_addresses.map do |email_address|
          if existing_user = User.find(:email_address => email_address)
            organization.memberships.find_or_create(:user => existing_user)
          elsif existing_invitation = Invitation.find(:sent_to_address => email_address)
            organization.memberships.find_or_create(:invitation_id => existing_invitation.id)
          else
            organization.memberships.create!(:email_address => email_address)
          end
        end
      end.flatten

      successful_json_response(nil, memberships)
    end

    post "/feedback" do
      Mailer.send(
        :to => ["admin@hyperarchy.com", "nathansobo+hyperarchy@gmail.com"],
        :subject => "#{current_user.full_name} submitted feedback",
        :body => "User id: #{current_user.id}\n\nUser email: #{current_user.email_address}\n\nTheir comments: #{params[:feedback]}"
      )
      successful_json_response
    end

    post "/dismiss_welcome_blurb" do
      current_user.update(:dismissed_welcome_blurb => true)
      successful_json_response
    end

    post "/dismiss_welcome_guide" do
      organization = Organization.find(params[:organization_id])
      organization.update!(:dismissed_welcome_guide => true)
      current_user.update!(:dismissed_welcome_guide => true)
      successful_json_response
    end

    post "/subscribe_to_organization/:id" do |organization_id|
      organization = Organization.find(organization_id)
      subscription_id = SubscriptionManager.subscribe_to_organization(current_real_time_client, organization)

      if subscription_id
        successful_json_response(subscription_id)
      else
        unsuccessful_json_response
      end
    end

    post "/visited" do
      return if current_user.guest?
      visit = ElectionVisit.find_or_create(:user_id => current_user.id, :election_id => params[:election_id])
      visit.update!(:updated_at => Time.now)
      successful_json_response(nil, visit)
    end

    post "/rankings" do
      raise Monarch::Unauthorized if !current_user || current_user.guest?
      organization = Candidate.find(params[:candidate_id]).election.organization
      new_membership = organization.ensure_current_user_is_member

      attributes = { :user_id => current_user.id, :candidate_id => params[:candidate_id] }

      if ranking = Ranking.find(attributes)
        ranking.update(:position => params[:position])
      else
        ranking = Ranking.create!(attributes.merge(:position => params[:position]))
      end
      successful_json_response({:ranking_id => ranking.id}, [ranking, new_membership].compact)
    end

    get "/fetch_election_data" do
      organization = Organization.find(params[:organization_id])
      raise Monarch::Unauthorized unless current_user
      if organization.private? && !(organization.current_user_is_member? || current_user.admin?)
        raise Monarch::Unauthorized
      end

      offset = params[:offset]
      limit = params[:limit]

      elections = organization.elections.offset(offset).limit(limit)
      candidates = elections.join_through(Candidate).join(User).on(Candidate[:creator_id].eq(User[:id]))
      visits = elections.join_through(current_user.election_visits)
      
      successful_json_response(nil, [elections, candidates, visits])
    end

    post "/client_error" do
      Mailer.send(
        :to => ["admin@hyperarchy.com", "nathansobo+hyperarchy@gmail.com"],
        :subject => "#{current_user.full_name} encountered a client error",
        :body => "User id: #{current_user.id}\n\nError info: #{params[:error]}"
      )
      successful_json_response
    end

    get "/notification" do
      authentication_required
      presenter = Emails::NotificationPresenter.new(current_user, "weekly")
      render_page Emails::Notification, :notification_presenter => presenter
    end

    get "/notification_text" do
      authentication_required
      presenter = Emails::NotificationPresenter.new(current_user, "weekly")
      presenter.to_s
    end


    get "/send_notification" do
      authentication_required

      notification_presenter = Emails::NotificationPresenter.new(current_user, "weekly")
      Mailer.send(
        :to => ["nathansobo@gmail.com", "maxbrunsfeld@gmail.com"],
        :subject => notification_presenter.subject,
        :notification_presenter => notification_presenter,
        :body => notification_presenter.to_s,
        :erector_class => Emails::Notification
      )
      render_page Emails::Notification, :notification_presenter => notification_presenter
    end
  end
end
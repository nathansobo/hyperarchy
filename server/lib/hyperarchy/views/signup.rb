module Views
  class Signup < Layout
    attr_reader :invitation, :user
    
    def body_content
      div :id => "centeredWrapper", :class => wrapper_class do
        form :id => "signupForm", :action => "/signup", :method => "post" do
          div :style => "border-bottom: 1px solid #ccc; margin-bottom: 20px;" do
            div :id => "smallLogo", :style => "margin: 0 auto 10px;"
          end

          if flash[:errors]
            div :id => "errors" do
              div "Whoops! Please correct the following problems and try again:", :id => "pleaseCorrect"
              ul do
                flash[:errors].each do |error|
                  li error
                end
              end
            end
          end

          label "First Name", :for => "user[first_name]"
          input :class => "text", :name => "user[first_name]", :value => user.first_name

          label "Last Name", :for => "user[last_name]"
          input :class => "text", :name => "user[last_name]", :value => user.last_name

          label "Email Address", :for => "user[email_address]"
          input :class => "text", :name => "user[email_address]"

          label "Choose Your Password", :for => "user[password]"
          input :class => "text", :name => "user[password]", :type => "password"

          unless invitation
            span "You can change this later.", :id => "canChangeLater"
            label "Organization Name", :for => "organization[name]"
            input :class => "text", :name => "organization[name]"
          end

          input :type => "submit", :value =>"Sign Up", :class => "glossyBlack roundedButton"
          div :class => "clear"
        end

        if invitation
          div :id => "invitationInfo" do
            h1 "Join the discussion."
            h2 "#{invitation.inviter.full_name} wants you to contribute your ideas and opinions to #{invitation.organizations.first.name} on Hyperarchy.", :id => "subheadline"

            ol :id => "description" do
              li "Converge on the best answers to your team's most important questions."
              li "Vote by ranking your favorite ideas and watch Hyperarchy compute the consensus instantly."
              li "Build shared confidence in your team's direction. Cut through confusion and resolve debates."
            end

            a "Learn More", :id => "learnMore", :href => "/learn_more", :class => "glossyGray roundedButton"
          end
        end
      end
    end

    def wrapper_class
      invitation ? "wide" : nil
    end

    def signup_with_invitation
      has_memberships = false
      auto_fill = {
        :first_name => user.first_name,
        :last_name => user.last_name,
        :email_address => user.email_address,
      }

      if invitation
        has_memberships = !invitation.memberships.empty?
        auto_fill[:first_name] ||= invitation.first_name
        auto_fill[:last_name] ||= invitation.last_name
        auto_fill[:email_address] ||= invitation.email_address
      end

      two_columns = has_memberships || flash[:errors]

      form :id => "signupForm", :action => "/signup", :method => "post" do
        div :class => two_columns ? "grid4 prefix1 suffix1" : "grid4 prefix4 suffix4" do
          label "First Name", :for => "first_name"
          input :class => "text", :name => "redeem[user[first_name]]", :value => auto_fill[:first_name] || ""

          label "Last Name", :for => "last_name"
          input :class => "text", :name => "redeem[user[last_name]]", :value => auto_fill[:last_name] || ""

          label "Email Address", :for => "email_address"
          input :class => "text", :name => "redeem[user[email_address]]", :value => auto_fill[:email_address] || ""

          label "Choose Password", :for => "password"
          input :class => "text", :name => "redeem[user[password]]", :type => "password", :value => ""

          input :type => "submit", :value =>"Sign Up"
        end

        if two_columns
          div :class => "grid5 suffix1" do
            if flash[:errors]
              ul :class => "errors" do
                flash[:errors].each do |error|
                  li(error)
                end
              end
            end

            if has_memberships
              h3 "Accept Invitations From These Organizations:"

              invitation.memberships.each do |membership|
                organization = membership.organization
                input :type => "checkbox", :name => "redeem[confirm_memberships][]", :id => "confirm_membership_#{membership.id}", :value => membership.id, :checked => true
                label organization.name, :class => 'inline', :for => "confirm_membership_#{membership.id}"
              end
            end
          end
        end
      end
    end

    def interested_form
      div :class => "grid6 prefix1" do
        div description_text, :class => "description"
      end

      div :class => "grid4 suffix1" do
        form :action => "/interested", :method => "post" do
          label "Your Email Address", :for => "email_address"
          input :class => "text", :name => "email_address", :value => ""
          label "Comments (Optional)"
          textarea :class => "text", :name => "comments"
          input :type => "submit"
        end
      end
    end

    def description_text
      case
      when flash[:invalid_invitation_code]
        %{
          Sorry. That invitation code is not valid. Please ensure you copied the entire url from the email.
          Or you can leave your email address and we will contact you as soon as possible.
        }
      when flash[:already_redeemed]
        %{
          Sorry. This invitation has already been accepted by someone else.
          Please ask your friend to send you another or enter your email address and we'll send you an invitation as soon as possible.
        }
      else
        %{
          Thanks for your interest. Hyperarchy is currently in a private testing phase.
          Please leave us your email address, and we'll send you an invitation as soon as possible.
        }
      end
    end

    def head_content
      javascript_include "underscore", "jquery-1.4.2"

      javascript %[
        var hasInvitation = #{(!invitation.nil?).to_json};

        $(function() {
          $("input[value='']:first").focus();
          if (hasInvitation) {
            mpmetrics.track('view signup page');
          } else {
            mpmetrics.track('view interested page');
          }
        });
      ]
    end
  end
end

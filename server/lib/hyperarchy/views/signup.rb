module Views
  class Signup < Layout
    attr_reader :invitation, :user
    
    def body_content
      div :class => "container12" do
        div :class => "grid10 prefix1 suffix1" do
          div :id => "bigLogo"
        end

        if invitation
          signup_form
        else
          interested_form
        end
      end
    end

    def signup_form
      has_memberships = !invitation.memberships.empty?
      two_columns = has_memberships || flash[:errors]

      form :id => "signupForm", :action => "/signup", :method => "post" do
        div :class => two_columns ? "grid4 prefix1 suffix1" : "grid4 prefix4 suffix4" do
          input :type => "hidden", :name => "invitation_code", :value => invitation.guid

          label "First Name", :for => "first_name"
          input :class => "text", :name => "redeem[user[first_name]]", :value => user.first_name || invitation.first_name || ""

          label "Last Name", :for => "last_name"
          input :class => "text", :name => "redeem[user[last_name]]", :value => user.last_name || invitation.last_name || ""

          label "Email Address", :for => "email_address"
          input :class => "text", :name => "redeem[user[email_address]]", :value => user.email_address || invitation.sent_to_address || ""

          label "Password", :for => "password"
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

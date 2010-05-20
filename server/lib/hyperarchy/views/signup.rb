module Views
  class Signup < Layout
    attr_reader :invitation
    
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
      div :class => "grid10 prefix1 suffix1" do
        form :id => "signupForm", :action => "/signup", :method => "post" do
          input :type => "hidden", :name => "invitation_code", :value => invitation.guid

          label "First Name", :for => "first_name"
          input :class => "text", :name => "user[first_name]"

          label "Last Name", :for => "last_name"
          input :class => "text", :name => "user[last_name]"

          label "Email Address", :for => "email_address"
          input :class => "text", :name => "user[email_address]", :value => invitation.sent_to_address

          label "Password", :for => "password"
          input :class => "text", :name => "user[password]", :type => "password"

          input :type => "submit", :value =>"Sign Up"
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
          input :class => "text", :name => "email_address"
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
          Hyperarchy is currently in a private testing phase.
          Please leave us your email address, and we'll send you an invitation as soon as possible.
        }
      end
    end

    def head_content
      javascript_include "jquery-1.4.2.js"
      javascript %[
        $(function() {
          $("input[name='user[first_name]']").focus();
        });
      ]
    end
  end
end

module Views
  class Signup < Layout
    attr_reader :invitation, :user

    def body_content
      div :id => "centeredWrapper", :class => wrapper_class do
        signup_form
        invitation_info
        div :class => "clear"
      end
    end

    def show_invitation_info?
      invitation || flash[:invalid_invitation_code] || flash[:already_redeemed]
    end

    def wrapper_class
      show_invitation_info?? "wide" : nil
    end

    def signup_form
      form :id => "signupForm", :class => "floatingCard dropShadow", :action => "/signup", :method => "post" do
        div :style => "border-bottom: 1px solid #ccc; margin-bottom: 20px;" do
          a :id => "smallLogo", :href => "/"
        end

        errors_section

        label "First Name", :for => "user[first_name]"
        input :class => "text", :name => "user[first_name]", :value => auto_fill_first_name

        label "Last Name", :for => "user[last_name]"
        input :class => "text", :name => "user[last_name]", :value => auto_fill_last_name

        label "Email Address", :for => "user[email_address]"
        input :class => "text", :name => "user[email_address]", :value => auto_fill_email_address

        label "Choose Your Password", :for => "user[password]"
        input :class => "text", :name => "user[password]", :type => "password"

        unless invitation
          span "You can change this later.", :id => "canChangeLater"
          label "Organization Name", :for => "organization[name]"
          input :class => "text", :name => "organization[name]"
        end

        div(
          raw("By clicking sign up, you are indicating that you agree to the <a href='/static/terms.html'>terms of service</a>."),
          :id => "agreeToTerms"
        )

        input :type => "submit", :value =>"Sign Up", :class => "glossyBlack roundedButton"

        div :id => "logIn" do
          div "Already have an account?"
          a "Click here to log in.", :href => "/login"
        end

        div :class => "clear"


      end
    end

    def errors_section
      if flash[:errors]
        div :class => "errors" do
          div "Whoops! Please correct the following problems and try again:", :id => "pleaseCorrect"
          ul do
            flash[:errors].each do |error|
              li error
            end
          end
        end
      end
    end

    def auto_fill_first_name
      user.first_name || invitation.nil?? "" : invitation.first_name
    end

    def auto_fill_last_name
      user.last_name || invitation.nil?? "" : invitation.last_name
    end

    def auto_fill_email_address
      user.email_address || invitation.nil?? "" : invitation.sent_to_address
    end

    def invitation_info
      return unless show_invitation_info?

      div :id => "invitationInfo" do
        if invitation
          h1 "Join the discussion."
          h2 "#{invitation.inviter.full_name} wants you to contribute your ideas and opinions to #{invitation.organizations.first.name} on Hyperarchy.", :id => "subheadline"

          ol :id => "description" do
            li "Converge on the best answers to your team's most important questions."
            li "Vote by ranking your favorite ideas and watch Hyperarchy compute the consensus instantly."
            li "Build shared confidence in your team's direction. Cut through confusion and resolve debates."
          end

          a "Learn More", :id => "learnMore", :href => "/learn_more", :class => "glossyGray roundedButton"
        elsif code = flash[:invalid_invitation_code]
          div :id => "invitationError" do
            h1 "Make sure you copied and pasted the invitation URL completely!"
            div "You're welcome to create your own organization, but the invitation code  you entered is not valid. If you copied it from an email, make sure you copied the entire URL.", :id => "description"
          end
        end
      end
    end

    def head_content
      javascript_include "underscore", "jquery-1.4.2"

      javascript %[
        var hasInvitation = #{(!invitation.nil?).to_json};

        $(function() {
          $("input[value='']:first").focus();
          mpq.push(['track', 'view signup page', {hasInvitation: hasInvitation}]);
        });
      ]
    end
  end
end

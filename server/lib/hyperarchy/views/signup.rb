module Views
  class Signup < Layout
    attr_reader :invitation_code
    
    def body_content
      div :class => "container12" do
        div :class => "grid10 prefix1 suffix1" do
          div :id => "bigLogo"
        end

        if invitation_code
          signup_form
        else
          interested_form
        end
      end
    end

    def signup_form
      div :class => "grid10 prefix1 suffix1" do
        form :id => "signupForm", :action => "/signup", :method => "post" do
          input :type => "hidden", :name => "invitation_code", :value => invitation_code

          label "First Name", :for => "first_name"
          input :class => "text", :name => "first_name"

          label "Last Name", :for => "last_name"
          input :class => "text", :name => "last_name"

          label "Email Address", :for => "email_address"
          input :class => "text", :name => "email_address"

          label "Password", :for => "password"
          input :class => "text", :name => "password", :type => "password"

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
      %{
        Hyperarchy is currently in a private testing phase.
        Please leave us your email address, and we'll send you an invitation as soon as possible.
      }
    end
  end
end

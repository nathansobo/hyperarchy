module Views
  class Login < Layout
    def body_content
      form :id => "loginForm", :class => "dropShadow", :action => "login", :method => "post" do
        div :style => "border-bottom: 1px solid #ccc; margin-bottom: 20px;" do
          a :id => "smallLogo", :href => "/"
        end

        if flash[:errors]
          div flash[:errors].join("\n"), :class => "errors"
        end

        if flash[:already_redeemed]
          div "The invitation code you entered has already been redeemed. If you've created an account you can log in.", :class => "errors"
        end

        label "Email Address", :for => "email_address"
        input :name => "email_address", :value => flash[:entered_email_address]
        label "Password", :for => "password"
        input :type => "password", :name => "password"
        input :value => "Log In", :type => "submit", :class => "glossyBlack roundedButton"

        div :id => "signUp" do
          div "Don't have an account?"
          a "Click here to sign up.", :href => "/signup"
        end

        div :class => "clear"

        if params[:redirected_from]
          input :type => "hidden", :name => "redirected_from", :value => params[:redirected_from]
        end
      end
    end

    def head_content
      javascript_include "underscore", "jquery-1.4.2"

      javascript %[
        $(function() {
          var errors = #{flash[:errors].to_json};
          var errorsOnEmailAddress = #{flash[:email_address_errors].to_json};
          if (!errors || errorsOnEmailAddress) {
            $("#loginForm input[name='email_address']").focus();
          } else {
            $("#loginForm input[name='password']").focus();
          }

          mpmetrics.track('view login page');
        });
      ]
    end
  end
end
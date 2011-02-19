module Views
  class Login < FloatingCard
    def floating_card_content
      form :id => "loginForm", :action => "login", :method => "post" do
        if flash[:already_redeemed]
          div "The invitation code you entered has already been redeemed. If you've created an account you can log in.", :class => "errors"
        end

        label "Email Address", :for => "email_address"
        input :name => "email_address", :value => flash[:entered_email_address], :tabindex => 1

        a "forgot my password", :id => "forgotPassword", :href => "/request_password_reset", :tabindex => 4
        label "Password", :for => "password"

        input :type => "password", :name => "password", :tabindex => 2
        input :value => "Log In", :type => "submit", :class => "glossyBlack roundedButton", :tabindex => 3

        div :id => "signUp" do
          div "Don't have an account?"
          a "Click here to sign up.", :href => "/signup", :tabindex => 5
        end

        div :class => "clear"

        if params[:redirected_from]
          input :type => "hidden", :name => "redirected_from", :value => raw(params[:redirected_from])
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

          mpq.push(['track', 'view login page']);
        });
      ]
    end
  end
end
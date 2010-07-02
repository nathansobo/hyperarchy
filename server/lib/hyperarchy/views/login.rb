module Views
  class Login < Layout
    def body_content
      div :class => "container12" do
        div :class => "grid10 prefix1 suffix1" do
          div :id => "bigLogo"

          form :id => "loginForm", :action => "login", :method => "post" do
            if flash[:errors]
              div flash[:errors], :id => "errors"
            end

            label "Email Address", :for => "email_address"
            input :name => "email_address", :value => flash[:entered_email_address]
            label "Password", :for => "password"
            input :type => "password", :name => "password"
            input :value => "Log In", :type => "submit"

            if params[:redirected_from]
              input :type => "hidden", :name => "redirected_from", :value => params[:redirected_from]
            end
          end
        end
      end
    end

    def head_content
      javascript_include "underscore.js"
      javascript_include "jquery-1.4.2.js"
      javascript_include "jquery.ba-bbq.js"

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
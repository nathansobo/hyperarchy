module Views
  class Home < Layout
    def body_content
      div :id => "notification", :style => "display: none"

      div :class => "container12" do
        div :class => "grid10 prefix1 suffix1" do
          div :id => "bigLogo"
        end

        div :id => "description", :class => "grid10 prefix1 suffix1" do
          rawtext description
        end
        
        div :class => "grid10 prefix1 suffix1" do
          form :id => "loginForm", :action => "login", :method => "post" do
            if flash[:errors]
              div flash[:errors], :id => "errors"
            end

            label "Email Address", :for => "email_address"
            input :name => "email_address", :value => flash[:entered_email_address]
            label "Password", :for => "password"
            input :type => "password", :name => "password"
            input :value => "Log In", :type => "submit"
          end
        end

        div :id => "signUpOrLogIn", :class => "grid10 prefix1 suffix1" do
          a :id => "signUp", :href => "/signup"
          a :id => "logIn", :href => "#logIn"
        end
      end
    end

    def head_content
      javascript_include "underscore.js"
      javascript_include "jquery-1.4.2.js"
      javascript_include "jquery.ba-bbq.js"

      javascript %[
        $(function() {
          var notification = #{flash[:notification].to_json};
          if (notification) {
            var box = $("#notification");
            box.html(notification);
            box.slideDown();
            _.delay(function() {
              box.slideUp('fast');
              box.empty();
            }, 4000);
          }

          $(window).bind("hashchange", function(e) {
            if (e.fragment == "") {
              $("#description").show();
              $("#signUpOrLogIn").show();
              $("#loginForm").hide();
              $("#loginForm #errors").hide();
            }

            if (e.fragment == "logIn") {
              var errors = #{flash[:errors].to_json};
              var errorsOnEmailAddress = #{flash[:email_address_errors].to_json};
              $("#description").hide();
              $("#signUpOrLogIn").hide();        
              $("#loginForm").show();
              if (!errors || errorsOnEmailAddress) {
                $("#loginForm input[name='email_address']").focus();
              } else {
                $("#loginForm input[name='password']").focus();
              }
            }
          });

          $(window).trigger("hashchange");
        });
      ]
    end

    def description
      %{
        Hyperarchy helps your organization track its own collective opinion.
        It lets you put any issue to a vote by raising questions, then allows members to suggest and rank answers to these questions.
        As individuals change their rankings, Hyperarchy computes and broadcasts the evolving consensus in real time, making it easier to communicate and make decisions.
     }
    end
  end
end
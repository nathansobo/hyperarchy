module Views
  class Home < Layout
    needs :flash, :current_user

    def body_content
      div :class => "container12" do
        div :class => "grid10 prefix1 suffix1" do
          div :id => "logo"
        end

        div :id => "description", :class => "grid10 prefix1 suffix1" do
          rawtext description
        end
        
        div :class => "grid10 prefix1 suffix1" do
          form :id => "loginForm", :action => "login", :method => "post" do
            if flash.errors
              div flash.errors, :id => "errors"
            end

            label "Email Address", :for => "email_address"
            input :name => "email_address"
            label "Password", :for => "password"
            input :type => "password", :name => "password"
            input :value => "Log In", :type => "submit"
          end
        end

        div :id => "signUpOrLogIn", :class => "grid10 prefix1 suffix1" do
          a :id => "signUp", :href => "#signUp"
          a :id => "logIn", :href => "#logIn"
        end
      end
    end

    def head_content
      javascript_include "jquery-1.4.2.js"
      javascript_include "jquery.ba-bbq.js"

      javascript %[
        $(function() {
          $(window).bind("hashchange", function(e) {
            if (e.fragment == "") {
              $("#description").show();
              $("#signUpOrLogIn").show();
              $("#loginForm").hide();
            }

            if (e.fragment == "logIn") {
              $("#description").hide();
              $("#signUpOrLogIn").hide();        
              $("#loginForm").show();
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
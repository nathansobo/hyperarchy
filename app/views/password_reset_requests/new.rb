module Views
  module PasswordResetRequests
    class New < Layouts::FloatingCard
      def floating_card_content
        form :id => "requestPasswordResetForm", :method => "post", :action => password_reset_requests_path do
          label "Email Address", :for => "email_address"
          input :name => "email_address", :value => @email_address
          input :value => "Reset My Password", :type => "submit", :class => "glossyBlack roundedButton"
          div :class => "clear"
        end
      end
    end
  end
end
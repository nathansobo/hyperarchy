module Views
  class RequestPasswordReset < FloatingCard
    def floating_card_content
      form :id => "requestPasswordResetForm", :method => "post" do
        label "Email Address", :for => "email_address"
        input :name => "email_address", :value => flash[:entered_email_address]
        input :value => "Reset My Password", :type => "submit", :class => "glossyBlack roundedButton"
        div :class => "clear"
      end
    end
  end
end
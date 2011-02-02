module Views
  class ResetPassword < FloatingCard
    attr_accessor :token

    def floating_card_content
      form :id => "resetPasswordForm", :method => "post" do
        label "New Password", :for => "password"
        input :name => "password", :type => "password"

        label "Confirm Password", :for => "password"
        input :name => "password_confirmation", :type => "password"

        input :name => "token", :type => "hidden", :value => token

        input :value => "Reset My Password", :type => "submit", :class => "glossyBlack roundedButton"
        div :class => "clear"
      end
    end
  end
end
module Views
  module PasswordResetRequests
    class Create < Layouts::FloatingCard
      def id
        'password-reset-request'
      end

      def floating_card_content
        div "An email has been sent to the address you provided. Please open it and follow the instructions to reset your password"
      end
    end
  end
end
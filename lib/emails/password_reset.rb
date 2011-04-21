module Hyperarchy
  module Emails
    class PasswordReset < Erector::Widget
      attr_reader :token

      def content
        html do
          body do
            rawtext "Visit the "
            a "password reset page", :href => "https://#{HTTP_HOST}/reset_password?token=#{token}"
            text " to assign a new password to your account."
          end
        end
      end
    end
  end
end
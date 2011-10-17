#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module Views
  module PasswordResetRequests
    class New < Layouts::FloatingCard
      def id
        'password-reset-request'
      end

      def floating_card_content
        form :method => "post", :action => password_reset_requests_path do
          label "Email Address", :for => "email_address"
          input :name => "email_address", :value => @email_address
          input :value => "Reset My Password", :type => "submit", :class => "button"
          div :class => "clear"
        end
      end
    end
  end
end
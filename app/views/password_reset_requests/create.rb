#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

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
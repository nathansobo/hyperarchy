#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module Views
  module PasswordResets
    class Expired < Layouts::FloatingCard
      def floating_card_content
        div do
          div "Sorry. That password reset token has expired."
          link_to "Request a new password reset", new_password_reset_request_path
        end
      end
    end
  end
end
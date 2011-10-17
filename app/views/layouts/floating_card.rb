#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module Views
  module Layouts
    class FloatingCard < Application
      def body_content
        div :id => id, :class => "lightbox", :style => "display: block" do
          if flash[:errors]
            div flash[:errors].join("\n"), :class => "errors"
          end

          floating_card_content
        end

        javascript %[
          document.getElementsByTagName('input')[0].focus();
        ]
      end

      def floating_card_content
      end

      def id
      end
    end
  end
end
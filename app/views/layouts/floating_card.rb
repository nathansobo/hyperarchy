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
module Views
  class FloatingCard < Layout
    def body_content
      div :class => "floatingCard dropShadow" do
        div :class => "floatingCardHeader" do
          a :id => "smallLogo", :href => "/"
        end

        if flash[:errors]
          div flash[:errors].join("\n"), :class => "errors"
        end

        floating_card_content
      end
    end

    def floating_card_content
    end
  end
end
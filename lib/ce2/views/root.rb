module Views
  class Root < Page
    def page_specific_javascript
      %{
        $(function() {
          $("#placeholder").replaceWith(Prez.build(Views.CE2));
        });
      }
    end

    def content
      div :id => "placeholder"
    end
  end
end
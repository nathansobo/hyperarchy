module Views
  class Home < Layout
    def body_content
      div :class => "container12" do
        div :class => "grid12" do
          div :id => "logo"
        end

        div :id => "description", :class => "grid10 prefix1 suffix1" do
          rawtext description
        end

        div :class => "grid2 prefix8" do
          div :id => "signup"
          div :id => "login"
        end
      end
    end

    def description
      %{
        Hyperarchy is a <b>democratic consensus tracker</b> for your organization.
        Start discussions by raising questions.
        Then suggest and rank answers.
        Hyperarchy continuously merges everyone's rankings into an evolving picture of the collective opinion.
     }
    end
  end
end
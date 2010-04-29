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
        div :id => "signUpOrLogIn", :class => "grid10 prefix1 suffix1" do
          div :id => "signUp"
          div :id => "logIn"
        end
      end
    end

    def description
      %{

        Hyperarchy helps your organization track its own collective opinion.
        It lets you put any issue to a vote by raising questions, then allows members to suggest and rank answers to these questions.
        As individuals change their rankings, Hyperarchy computes and broadcasts the evolving consensus in real time, making it easier to communicate and make decisions.
     }
    end
  end
end
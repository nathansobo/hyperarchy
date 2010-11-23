module Views
  class LearnMore < Layout
    def body_content
      div :id => "header", :class => "container12" do
        div :class => "grid6" do
          a :href => "/", :id => "smallLogo"
        end
        div :id => "links", :class => "grid6" do
          a :id => "logIn", :href => "/login"
          a :id => "signUp", :href => "/signup"
        end
        div :class => "clear"
      end

      div :class => "container12" do
        div :id => "screenshots", :class => "grid6" do
          div :id => "screenshot1", :class => "screenshot"
          div :id => "screenshot2", :class => "screenshot"
        end
        div :id => "benefits", :class => "grid6" do
          div "Hyperarchy makes it easy for your organization to put anything to a vote. Raise a question, then watch in real time as your team suggests and ranks answers. Hyperarchy computes the consensus instantly using a state-of-the-art electoral algorithm.", :id => "summary"

          h2 "Fewer meetings  "
          div "Meetings are expensive. A one hour meeting with 10 participants costs you 10 hours of productivity. With Hyperarchy, your team can reach a working consensus without stopping their work.", :class => "description"

          h2 "More productive discussions"
          div "When you do hold a meeting, awareness of the consensus focuses and informs discussion. Bring laptops or iPads with you, and you can vote during the meeting to resolve debates and drive the conversation forward. Before wrapping up, vote on action-items and walk away with tangible results.", :class => "description"

          h2 "Get everyone on board"
          div "It's easier to get the team excited about what they are doing when everyone is involved in making decisions.", :class => "description"

          h2 "Leverage your whole team's brainpower"
          div "As an individual, you may see a problem or opportunity but never find an appropriate time to bring it up. Raise the issue in Hyperarchy, however, and you may be surprised to find that other people agree with you. When anyone's idea can be voted to the top, individual minds become a lot more valuable."
        end
        div :class => "clear"
      end

      div :id => "features", :class => "container12" do
        div :id => "featuresHeader", :class => "grid12" do
          h2 "Key Features"
        end

        div :class => "grid3" do
          h3 "Democratic dialog"
          div "In Hyperarchy, interaction is structured as a dialog. You raise questions, then your join your teammates in suggesting and ranking answers to those questions. Hyperarchy merges your rankings together into a single consensus, and you can change your vote at any time."
        end

        div :class => "grid3" do
          h3 "Mathematically sound"
          div "There's actually an entire field of mathematics called social choice theory that studies the notion of fairness in elections, and Hyperarchy builds on this work. We use Tideman's Ranked Pairs algorithm, which is proven to be an extremely fair way of calculating election results."
        end

        div :class => "grid3" do
          h3 "Collaborate in real-time"
          div "You never need to hit the refresh button while using Hyperarchy. When you collaborate with your teammates, new questions, suggestions, and election results are transmitted to your browser instantly, making Hyperarchy a natural fit for fast-paced, face-to-face meetings."
        end

        div :class => "grid3" do
          h3 "Intuitive user interface"
          div "Hyperarchy feels more like a desktop application than a clunky traditional web-app. The interaction is smooth and responsive, and you perform ranking by dragging and dropping. It keeps you aware of the consensus without slowing you down or getting in the way."
        end

        div :class => "clear"
      end

      div :id => "signUpArea", :class => "container12" do
        div :class => "grid5 prefix1" do
          div "Hyperarchy is free. Sign up and create your first election in less than a minute.", :id => "signUpExplanation"
        end
        div :class => "grid5 suffix1" do
          a "Sign Up Free", :href => "/signup", :class => "glossyBlack roundedButton"
        end
        div :class => "clear"
      end
    end

    def head_content
      javascript %[
        $(function() {
          mpq.push(['track', 'view learn more page']);
        });
      ]
    end
  end
end
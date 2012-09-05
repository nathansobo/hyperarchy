require "spec_helper"

describe EventObserver do
  describe "#observe" do
    let(:events) { Hash.new {|h,k| h[k] = [] }}

    before do
      stub(Pusher[:global]).trigger do |channel, event|
        events[channel].push(event)
      end

      EventObserver.observe(Question, Answer)
    end

    it "causes all events on the given model classes to be sent to pusher" do
      freeze_time

      question = Question.make!
      events['operation'].shift.should == ["create", "questions", question.wire_representation, {}]

      question.update :body => "Hello?"
      events['operation'].shift.should == ["update", "questions", question.id, {"body"=>"Hello?"}]

      question.destroy
      events['operation'].shift.should == ["destroy", "questions", question.id]
    end

    it "sends extra records for create events if desired" do
      set_current_user(User.make!)
      question = Question.make!
      events['operation'].clear

      answer = question.answers.make!
      events['operation'].shift.should == [
        "create", "answers", answer.wire_representation, { "users"=> { current_user.id.to_s => current_user.wire_representation } }
      ]
    end
  end
end

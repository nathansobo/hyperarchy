require "spec_helper"

describe EventObserver do
  describe "#observe" do
    include BuildClientDataset

    let(:group) { Group.make! }
    let(:events) { Hash.new {|h,k| h[k] = [] }}
    let(:current_user) { User.create! }

    before do
      stub(Pusher["private-#{PUSHER_CHANNEL_PREFIX}-group-#{group.id}"]).trigger_async do |channel, event|
        events[channel].push(event)
      end

      Prequel.session.current_user = current_user
      EventObserver.observe(Question, Answer)

    end

    it "causes all events on the given model classes to be sent to pusher" do
      freeze_time

      question = group.questions.make!
      events['operation'].shift.should == ["create", "questions", question.wire_representation, build_client_dataset(current_user)]

      question.update :body => "Hello?"
      events['operation'].shift.should == ["update", "questions", question.id, {"body"=>"Hello?"}]

      question.destroy
      events['operation'].shift.should == ["destroy", "questions", question.id]
    end

    it "sends extra records for create events if desired" do
      question = group.questions.make!
      events['operation'].clear

      answer = question.answers.make!
      events['operation'].shift.should == [
        "create", "answers", answer.wire_representation, build_client_dataset(current_user)
      ]
    end
  end
end

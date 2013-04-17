require "spec_helper"

describe EventObserver do
  describe "#observe" do
    include BuildClientDataset

    let(:group) { Group.make! }
    let(:events) { Hash.new {|h,k| h[k] = [] }}
    let(:current_user) { User.create! }

    before do
      Prequel.session.current_user = current_user
      EventObserver.observe(Question, Answer)
    end

    def events_by_channel
      Thread.current[:events_by_channel]
    end

    it "causes all events on the given model classes to be sent to pusher on the channel for the correct group / user" do
      freeze_time

      question = group.questions.make!
      event = events_by_channel["private-group-#{group.id}"].shift
      event.should == ["create", "questions", question.wire_representation, build_client_dataset(current_user)]

      question.update :body => "Hello?"
      event = events_by_channel["private-group-#{group.id}"].shift
      event.should == ["update", "questions", question.id, {"body"=>"Hello?"}]

      question.destroy
      event = events_by_channel["private-group-#{group.id}"].shift
      event.should == ["destroy", "questions", question.id]
    end

    it "sends extra records for create events if desired" do
      question = group.questions.make!
      events_by_channel["private-group-#{group.id}"].clear

      answer = question.answers.make!
      event = events_by_channel["private-group-#{group.id}"].shift

      event.should == [
        "create", "answers", answer.wire_representation, build_client_dataset(current_user)
      ]
    end
  end
end

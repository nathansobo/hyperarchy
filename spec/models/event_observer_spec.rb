require "spec_helper"

describe EventObserver do
  describe "#observe" do
    before do
      stub(EventObserver).post
    end

    let(:events) { [] }

    it "causes all events on the given model classes to be sent to the appropriate channels on the socket server" do
      EventObserver.observe(User, Organization, Question)

      freeze_time
      org1 = Organization.make
      org2 = Organization.make
      jump 1.minute

      expect_event(org1)
      org1.update(:name => 'New Org Name', :description => 'New Org Description')
      events.shift.should == ["update", "organizations", org1.id, {"name"=>"New Org Name", "description"=>"New Org Description", 'updated_at' => Time.now.to_millis}]

      expect_event(org1)
      question = org1.questions.make
      events.shift.should == ["create", "questions", question.wire_representation, {}]

      expect_event(org1) # 2 events, 1 for the question count update and 1 for the destroy
      expect_event(org1)
      question.destroy
      events.shift.should == ["update", "organizations", org1.id, {"question_count"=>0}]
      events.shift.should == ["destroy", "questions", question.id]

      user = org1.make_member
      org2.memberships.make(:user => user)

      expect_event(org1)
      expect_event(org2)

      user.update(:first_name => "MartyPrime")

      event = ["update", "users", user.id, {"first_name"=>"MartyPrime"}]
      events.should == [event, event]
    end

    it "sends extra records for create events if desired" do
      extra_question = Question.make
      org1 = Organization.make
      instance_of(Question).extra_records_for_create_events { [extra_question] }

      EventObserver.observe(Question)

      freeze_time

      expect_event(org1)
      question = org1.questions.make
      extra_records = RecordsWrapper.new(events.shift.last)
      extra_records.should include(extra_question)
    end

    def expect_event(organization)
      mock(EventObserver).post(organization.event_url, is_a(Hash)) do |url, options|
        events.push(JSON.parse(options[:params][:message]))
      end
    end
  end
end

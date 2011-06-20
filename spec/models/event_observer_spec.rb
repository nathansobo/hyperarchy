require "spec_helper"

describe EventObserver do
  include ControllerSpecMethods

  describe "#observe" do
    before do
      stub(EventObserver).post
    end

    let(:events) { [] }

    it "causes all events on the given model classes to be sent to the appropriate channels on the socket server" do
      EventObserver.observe(User, Organization, Election)

      freeze_time
      org1 = Organization.make
      org2 = Organization.make
      jump 1.minute

      expect_event(org1)
      org1.update(:name => 'New Org Name', :description => 'New Org Description')
      events.shift.should == ["update", "organizations", org1.id, {"name"=>"New Org Name", "description"=>"New Org Description", 'updated_at' => Time.now.to_millis}, {}]

      expect_event(org1)
      election = org1.elections.make
      events.shift.should == ["create", "elections", election.wire_representation, {}]

      expect_event(org1)
      election.destroy
      events.shift.should == ["destroy", "elections", election.id, {}]

      user = org1.make_member
      org2.memberships.make(:user => user)

      expect_event(org1)
      expect_event(org2)

      user.update(:first_name => "MartyPrime")

      event = ["update", "users", user.id, {"first_name"=>"MartyPrime"}, {}]
      events.should == [event, event]
    end

    it "sends extra records for events" do
      extra_election = Election.make
      instance_of(Organization).extra_records_for_events { [extra_election] }
      instance_of(Election).extra_records_for_events { [extra_election] }

      EventObserver.observe(User, Organization, Election)

      freeze_time
      org1 = Organization.make
      org2 = Organization.make
      jump 1.minute

      expect_event(org1)
      org1.update(:name => 'New Org Name', :description => 'New Org Description')
      extra_records = RecordsWrapper.new(events.shift.last)
      extra_records.should include(extra_election)

      expect_event(org1)
      election = org1.elections.make
      extra_records = RecordsWrapper.new(events.shift.last)
      extra_records.should include(extra_election)

      expect_event(org1)
      election.destroy
      extra_records = RecordsWrapper.new(events.shift.last)
      extra_records.should include(extra_election)
    end

    def expect_event(organization)
      mock(EventObserver).post(organization.event_url, is_a(Hash)) do |url, options|
        events.push(JSON.parse(options[:params][:message]))
      end
    end
  end
end

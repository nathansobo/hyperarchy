require File.expand_path("#{File.dirname(__FILE__)}/../../monarch_spec_helper")

module Model
  describe Repository do
    describe "#transaction" do
      attr_reader :repository
      before do
        @repository = Repository.instance
        stub(repository).pause_events
        stub(repository).cancel_events
        stub(repository).resume_events
      end

      context "when the given block does not raise any errors, including Sequel::Rollback" do
        it "pauses all events, yields to the given block, then resumes all events" do
          pause_events_called = false
          resume_events_called = false

          mock(repository).pause_events { pause_events_called = true }.ordered
          dont_allow(repository).cancel_events
          mock(repository).resume_events { resume_events_called = true }.ordered

          repository.transaction do
            pause_events_called.should be_true
            resume_events_called.should be_false
          end
        end
      end

      context "when the given block raises an error" do
        it "pauses all events, yields to the given block, and cancels all events" do
          pause_events_called = false

          mock(repository).pause_events { pause_events_called = true }.ordered
          mock(repository).cancel_events.ordered
          dont_allow(repository).resume_events

          lambda do
            repository.transaction do
              pause_events_called.should be_true
              raise "a normal error"
            end
          end.should raise_error("a normal error")
        end
      end

      context "when the given block raises a Sequel::Rollback exception" do
        it "pauses all events, yields to the given block, and cancels all events" do

        end
      end
    end
    describe "#initialize_local_identity_map" do
      after do
        # verify doubles before the global after clears the identity map, causing an unexpected invocation
        RR::verify_doubles
      end

      it "calls #initialize_identity_map on every Table" do
        Repository.tables.each do |table|
          mock(table).initialize_identity_map
        end
        Repository.initialize_local_identity_map
      end
    end

    describe "#clear_local_identity_map" do
      after do
        # verify doubles before the global after clears the identity map, causing an unexpected invocation
        RR::verify_doubles
      end

      it "calls #clear_identity_map on every Table" do
        Repository.tables.each do |table|
          mock(table).clear_identity_map
        end
        Repository.clear_local_identity_map
      end
    end
  end
end

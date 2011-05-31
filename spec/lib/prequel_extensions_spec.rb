require 'spec_helper'

describe "Prequel extensions" do
  describe Prequel::Record do
    describe "#lock and #unlock" do
      it "grabs and releases a lock named after the record in redis on the outer-most calls, but does not grab the same lock twice on this thread" do
        election = Election.make
        lock_name = "/elections/#{election.id}"

        RR.reset # clear global stubbing of locks
        mock($redis).lock(lock_name).once
        mock($redis).unlock(lock_name).once

        election.lock
        election.lock
        election.lock
        election.unlock
        election.unlock
        election.unlock

        mock($redis).lock(lock_name).once
        mock($redis).unlock(lock_name).once
        election.lock
        election.unlock
      end
    end
  end
end
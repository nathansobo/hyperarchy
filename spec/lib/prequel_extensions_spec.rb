require 'spec_helper'

describe "Prequel extensions" do
  describe Prequel::Record do
    describe "#lock and #unlock" do
      it "grabs and releases a lock named after the record in redis on the outer-most calls, but does not grab the same lock twice on this thread" do
        question = Question.make
        lock_name = "/questions/#{question.id}"

        RR.reset # clear global stubbing of locks
        mock($redis).lock(lock_name).once
        mock($redis).unlock(lock_name).once

        question.lock
        question.lock
        question.lock
        question.unlock
        question.unlock
        question.unlock

        mock($redis).lock(lock_name).once
        mock($redis).unlock(lock_name).once
        question.lock
        question.unlock
      end
    end
  end
end
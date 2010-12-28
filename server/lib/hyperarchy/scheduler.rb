module Hyperarchy
  module Scheduler
    extend self

    def start
      Clockwork.every(1.minute, "update election scores") do
        Hyperarchy.defer do
          Election.update_scores
        end
      end

      Thread.new do
        Thread.abort_on_exception = true
        Clockwork.run
      end
    end
  end
end
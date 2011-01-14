module Hyperarchy
  module Scheduler
    extend self

    def start
      scheduler = Rufus::Scheduler.start_new
      scheduler.every '1m' do
        Hyperarchy.defer do
          puts "update scores"
          Election.update_scores
        end
      end

      # every hour
      scheduler.cron '0 0 * * * *' do
        Hyperarchy.defer do
          puts "Sending hourly notifications"
          Notifier.new.send_periodic_notifications(:hourly)
        end
      end

      # 5:30 am daily PST
      scheduler.cron '0 30 5 * * * America/Los_Angeles' do
        Hyperarchy.defer do
          puts "Sending daily notifications"
          Notifier.new.send_periodic_notifications(:daily)
        end
      end

      # 5:30 am on wednesday PST
      scheduler.cron '0 30 5 * * 3 America/Los_Angeles' do
        Hyperarchy.defer do
          puts "Sending weekly notifications"
          Notifier.new.send_periodic_notifications(:weekly)
        end
      end
    end
  end
end
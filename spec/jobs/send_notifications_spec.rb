require 'spec_helper'

module Jobs
  describe SendNotifications do
    let(:job) { SendNotifications.new('period' => period) }
    let(:period) { 'hourly' }

  end
end
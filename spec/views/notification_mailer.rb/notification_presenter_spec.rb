require 'spec_helper'

module Views
  module NotificationMailer
    describe NotificationPresenter do
      describe "for a periodic notification" do
        describe "when the user prefers to be notified of all event types with this periodicity" do
          let(:organization) { Organization.make }


          it "presents all event types in the period that occurred after the user's last visit" do
            freeze_time



          end
        end
      end
    end
  end
end
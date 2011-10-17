#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

module SupportsNotifications
  extend ActiveSupport::Concern
  included { attr_accessor :suppress_immediate_notifications }

  def send_immediate_notifications
    return if suppress_immediate_notifications
    Jobs::SendImmediateNotifications.create(:class_name => self.class.name, :id => id)
  end
end

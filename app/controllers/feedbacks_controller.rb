#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class FeedbacksController < ApplicationController
  def create
    feedback = params[:feedback]
    run_later do
      AdminMailer.feedback(current_user, feedback).deliver
    end
    head :ok
  end
end

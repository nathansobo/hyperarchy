#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class QuestionVisitsController < ApplicationController
  def create
    head :ok and return if current_user.guest?
    visit = current_user.question_visits.find_or_create(:question_id => params[:question_id])
    visit.update(:updated_at => Time.now)
    render :json => build_client_dataset(visit)
  end
end

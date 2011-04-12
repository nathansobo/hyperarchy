class ElectionVisitsController < ApplicationController
  def create
    unless current_user.guest?
      existing_visit = current_user.election_visits.find_or_create(:election_id => params[:election_id])
      existing_visit.update(:updated_at => Time.now)
    end
    head :ok
  end
end

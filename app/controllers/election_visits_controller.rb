class ElectionVisitsController < ApplicationController
  def create
    head :ok and return if current_user.guest?
    visit = current_user.election_visits.find_or_create(:election_id => params[:election_id])
    visit.update(:updated_at => Time.now)
    render :json => build_client_dataset(visit)
  end
end

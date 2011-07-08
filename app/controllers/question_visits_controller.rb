class QuestionVisitsController < ApplicationController
  def create
    head :ok and return if current_user.guest?
    visit = current_user.question_visits.find_or_create(:question_id => params[:question_id])
    visit.update(:updated_at => Time.now)
    render :json => build_client_dataset(visit)
  end
end

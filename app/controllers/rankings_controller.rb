class RankingsController < ApplicationController
  def create
    attributes = { :user_id => current_user.id, :answer_id => params[:answer_id] }

    if ranking = Ranking.find(attributes)
      ranking.update(:position => params[:position])
    else
      ranking = Ranking.create!(attributes.merge(:position => params[:position]))
    end

    render :json => {
      :data => {:ranking_id => ranking.id },
      :records => build_client_dataset(ranking)
    }
  end

  def destroy
    ranking = Ranking.find(:user_id => current_user_id, :answer_id => params[:answer_id])
    ranking.destroy()
    head :ok
  end
end


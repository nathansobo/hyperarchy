class RankingsController < ApplicationController
  def create
    raise SecurityError if !current_user || current_user.guest?

    organization = Candidate.find(params[:candidate_id]).question.organization
    new_membership = organization.ensure_current_user_is_member

    attributes = { :user_id => current_user.id, :candidate_id => params[:candidate_id] }

    if ranking = Ranking.find(attributes)
      ranking.update(:position => params[:position])
    else
      ranking = Ranking.create!(attributes.merge(:position => params[:position]))
    end

    render :json => {
      :data => {:ranking_id => ranking.id},
      :records => build_client_dataset([ranking, new_membership].compact)
    }
  end
end

#  Copyright (c) 2010-2011, Nathan Sobo and Max Brunsfeld.  This file is
#  licensed under the Affero General Public License version 3 or later.  See
#  the COPYRIGHT file.

class RankingsController < ApplicationController
  def create
    raise SecurityError if !current_user || current_user.guest?

    organization = Answer.find(params[:answer_id]).question.organization
    new_membership = organization.ensure_current_user_is_member

    attributes = { :user_id => current_user.id, :answer_id => params[:answer_id] }

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
